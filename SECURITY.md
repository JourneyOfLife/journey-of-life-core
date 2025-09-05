# 🔐 Security Policy – Journey of Life

At **Journey of Life**, we take the security and privacy of our users — including parishes, funeral homes, and grieving families — with the utmost seriousness.

Our platforms handle sensitive data, including personal information, donation records, and bereavement details. We are committed to protecting this data through **strong technical controls**, **compliance with EU regulations**, and **transparent disclosure practices**.

## 📞 Reporting a Vulnerability

If you discover a security vulnerability, **please disclose it responsibly**:

- 📧 Email: **security@journeyoflife.lt** (PGP key available on request)
- 🕒 We aim to acknowledge all reports within **24 hours**
- 🛠️ Critical issues will be triaged and patched within **7 days**

> ❌ Do **not** open public GitHub issues for security vulnerabilities.

We welcome responsible disclosure from ethical researchers and offer gratitude (and spiritual blessings!) in return.

## 🛡️ Security Practices

### ✅ Data Protection
- Full compliance with **GDPR (EU) 2016/679**
- Data minimization and purpose limitation
- Right to access, rectify, and delete personal data
- Data Portability via API endpoints

### 🧩 Infrastructure Security
- **On-premise servers**: Ubuntu 24.04 LTS in Oracle VirtualBox (for sensitive CRM data)
- **Cloud**: Google Cloud Platform (GCP) with VPC, IAM, and CDN
- **Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Secrets Management**: HashiCorp Vault + GitHub OIDC federation

### 🧰 Development & CI/CD
- **Branch Protection**: `main` requires PR, 1 reviewer, and status checks
- **GPG Signing**: All commits are signed
- **Dependency Scanning**: Dependabot + GitHub Advanced Security
- **Static Analysis**: CodeQL for Python, JavaScript, and YAML
- **CI/CD Pipeline**: GitHub Actions with isolated environments

### 🧪 Audits & Compliance
- Regular penetration testing
- Alignment with **ISO 27001** and **SOC 2 Type II** frameworks
- Audit logs retained for 365 days
- Annual third-party security review

## 🧾 Compliance Standards

| Standard | Status |
|--------|--------|
| GDPR | ✅ Fully Compliant |
| AI Act (EU) | ✅ Human-in-the-loop, transparent AI |
| EN 15017:2005 (Funeral Services) | ✅ Implemented |
| WCAG 2.1 AA | ✅ Accessible Design |
| ISO 27001 | 🔄 In Progress (2025 Certification) |

## 📁 Responsible Disclosure Process

1. Researcher reports via **security@journeyoflife.lt**
2. We acknowledge and assign severity (Low/Medium/High/Critical)
3. Patch developed and tested in isolated environment
4. Coordinated disclosure timeline agreed
5. Patch deployed; CVE issued if applicable
6. Public advisory published (optional, with credit)

## 📚 More Information

- [Privacy Policy](https://journeyoflife.eu/privacy)
- [Data Processing Agreement (DPA)](https://journeyoflife.eu/dpa)
- [Compliance Dashboard](https://github.com/JourneyOfLife/docs/tree/main/compliance)

> “Above all, love each other deeply, because love covers over a multitude of sins.” – 1 Peter 4:8
