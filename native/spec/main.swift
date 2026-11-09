import Foundation
import Security

func grant(_ extra: [String: Any] = [:]) -> [String: Any] {
    var entry: [String: Any] = [kSecTrustSettingsResult as String: SecTrustSettingsResult.trustRoot.rawValue]
    entry.merge(extra) { _, value in value }
    return entry
}

let cases: [(String, [[String: Any]], Bool?)] = [
    ("empty settings grant root trust", [], true),
    ("unrestricted root grant", [grant()], true),
    ("SSL server policy grant", [grant([kSecTrustSettingsPolicy as String: SecPolicyCreateSSL(true, nil)])], true),
    ("any key usage permits unrestricted grant", [grant([kSecTrustSettingsKeyUsage as String: UInt32.max])], true),
    ("usage restricted grant cannot become unrestricted trust", [grant([kSecTrustSettingsKeyUsage as String: 2])], nil),
    ("client-only SSL grant cannot trust brokers", [grant([kSecTrustSettingsPolicy as String: SecPolicyCreateSSL(false, nil)])], nil),
    ("hostname-scoped SSL policy cannot trust all brokers", [grant([kSecTrustSettingsPolicy as String: SecPolicyCreateSSL(true, "example.com" as CFString)])], nil),
    ("hostname scoped settings cannot trust all brokers", [grant([kSecTrustSettingsPolicyString as String: "example.com"])], nil),
    ("non-SSL policy grant is ignored", [grant([kSecTrustSettingsPolicy as String: SecPolicyCreateBasicX509()])], nil),
    ("denial overrides grant in same domain", [grant(), [kSecTrustSettingsResult as String: SecTrustSettingsResult.deny.rawValue]], false),
    ("scoped denial is conservatively excluded", [[kSecTrustSettingsResult as String: SecTrustSettingsResult.deny.rawValue, kSecTrustSettingsPolicyString as String: "example.com"]], false),
    ("unspecified trust remains unspecified", [[kSecTrustSettingsResult as String: SecTrustSettingsResult.unspecified.rawValue]], nil),
]

for (name, entries, expected) in cases {
    let actual = try trustSettingsDecision(entries)
    precondition(actual == expected, "Failed: \(name); expected \(String(describing: expected)), got \(String(describing: actual))")
}
print("\(cases.count) native macOS trust policy tests passed")
