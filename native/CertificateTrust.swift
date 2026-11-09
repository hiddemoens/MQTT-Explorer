import Foundation
import Security

// Return nil when no unrestricted TLS-server grant or relevant denial applies.
func trustSettingsDecision(_ entries: [[String: Any]]) throws -> Bool? {
    if entries.isEmpty { return true }
    var granted = false
    for entry in entries {
        var scopedPolicy = false
        if let policy = entry[kSecTrustSettingsPolicy as String] {
            guard let policyProperties = SecPolicyCopyProperties(policy as! SecPolicy) else {
                throw NSError(domain: "Invalid certificate trust policy", code: 1)
            }
            let properties = policyProperties as NSDictionary
            if properties[kSecPolicyOid] as? String != kSecPolicyAppleSSL as String { continue }
            scopedPolicy = (properties[kSecPolicyClient] as? NSNumber)?.boolValue == true
                || properties[kSecPolicyName] != nil
        }
        let result = (entry[kSecTrustSettingsResult as String] as? NSNumber)?.uint32Value
            ?? SecTrustSettingsResult.trustRoot.rawValue
        if result == SecTrustSettingsResult.deny.rawValue { return false }
        if scopedPolicy { continue }
        if let usage = entry[kSecTrustSettingsKeyUsage as String] {
            guard let value = usage as? NSNumber, value.uint32Value == UInt32.max else { continue }
        }
        if entry[kSecTrustSettingsApplication as String] != nil
            || entry[kSecTrustSettingsPolicyString as String] != nil { continue }
        if result == SecTrustSettingsResult.trustRoot.rawValue
            || result == SecTrustSettingsResult.trustAsRoot.rawValue { granted = true }
    }
    if granted { return true }
    return nil
}
