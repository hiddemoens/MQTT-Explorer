// Read trust anchors without evaluating a root as if it were a TLS server leaf.
import Foundation
import Security

func check(_ status: OSStatus, _ operation: String) throws {
    guard status == errSecSuccess else {
        throw NSError(domain: operation, code: Int(status))
    }
}

func hasNoSettings(_ status: OSStatus) -> Bool {
    return status == errSecItemNotFound || status == errSecNoTrustSettings
}

// User settings override administrator settings; both override system defaults.
// Scoped grants cannot safely become unrestricted Node TLS trust anchors.
// Scoped denials are conservatively excluded for all MQTT connections.
func trusted(_ certificate: SecCertificate, systemAnchor: Bool) throws -> Bool {
    for domain in [SecTrustSettingsDomain.user, .admin] {
        var settings: CFArray?
        let status = SecTrustSettingsCopyTrustSettings(certificate, domain, &settings)
        if hasNoSettings(status) { continue }
        try check(status, "Read certificate trust settings")
        guard let entries = settings as? [[String: Any]] else {
            throw NSError(domain: "Invalid certificate trust settings", code: 1)
        }
        if let decision = try trustSettingsDecision(entries) { return decision }
    }
    return systemAnchor
}

func loadCertificates() throws -> [String] {
    var anchors: CFArray?
    try check(SecTrustCopyAnchorCertificates(&anchors), "Read system trust anchors")
    guard let system = anchors as? [SecCertificate], !system.isEmpty else {
        throw NSError(domain: "No system trust anchors available", code: 1)
    }
    var candidates = system.map { ($0, true) }
    for domain in [SecTrustSettingsDomain.user, .admin] {
        var certificates: CFArray?
        let status = SecTrustSettingsCopyCertificates(domain, &certificates)
        if hasNoSettings(status) { continue }
        try check(status, "Read configured trust anchors")
        guard let configured = certificates as? [SecCertificate] else {
            throw NSError(domain: "Invalid configured trust anchors", code: 1)
        }
        candidates += configured.map { ($0, false) }
    }
    var result = Set<String>()
    for (certificate, systemAnchor) in candidates {
        if try !trusted(certificate, systemAnchor: systemAnchor) { continue }
        let data = SecCertificateCopyData(certificate) as Data
        let encoded = data.base64EncodedString(options: [.lineLength64Characters, .endLineWithLineFeed])
        result.insert("-----BEGIN CERTIFICATE-----\n" + encoded + "\n-----END CERTIFICATE-----\n")
    }
    return result.sorted()
}

do {
    let data = try JSONSerialization.data(withJSONObject: loadCertificates())
    FileHandle.standardOutput.write(data)
} catch {
    FileHandle.standardError.write(Data("Unable to read macOS system certificates: \(error)\n".utf8))
    exit(1)
}
