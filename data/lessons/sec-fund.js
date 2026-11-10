"use strict";

/* Step 5: Security fundamentals. */
(() => {
const R = String.raw;

Object.assign(window.LESSONS, {
  "sec-fund": [
    "Up to now you've learned how IT works. Security fundamentals are the ideas that sit on top: what we're protecting, from whom, and how we decide what's worth fixing. This is most of what Security+ and entry-level interviews cover.",
    { h: "Defence in depth" },
    "No single control stops everything. Good security stacks layers so that when one fails (and one always does) the next one catches the attacker or at least makes noise.",
    { fig: "did", cap: "Defence in depth. An attacker going after the data has to get through every ring, and each ring is a chance to stop or spot them." },
    { h: "Words people mix up" },
    { terms: [
      ["Asset", "Anything worth protecting: data, systems, people, reputation."],
      ["Threat", "Something that could cause harm: a ransomware group, a flood, a careless insider."],
      ["Vulnerability", "A weakness a threat could use: an unpatched server, a reused password."],
      ["Exploit", "The actual method or code that uses a vulnerability."],
      ["Risk", "The chance a threat uses a vulnerability, combined with how bad it would be."],
      ["Control", "Anything that reduces risk: MFA, a policy, a lock, a backup."],
    ] },
    "A burglar is a threat, an unlocked window is a vulnerability, and the risk is how likely a break-in is times what you'd lose. A lock is a control.",
    { h: "How to work through this step" },
    { ol: [
      "[[cia-risk|The CIA triad and risk]]: the vocabulary for everything else.",
      "[[iam|Authentication and access]] and [[crypto|cryptography]]: the two most-used technical controls.",
      "[[threats|Common threats]] and [[vulns|vulnerabilities]]: what you're defending against.",
      "[[frameworks|Frameworks]] and [[law-ethics|law and ethics]]: the rules you work within.",
    ] },
    { check: [
      ["An internet-facing server is missing a patch. Is that a threat, a vulnerability or a risk?", "A vulnerability. The threat is whoever might exploit it; the risk is how likely that is and how much damage it would do."],
      ["Why isn't a single strong firewall enough?", "Attacks get past individual controls (phishing, stolen passwords, insiders). Layers mean one failure doesn't lose everything."],
    ] },
  ],

  "cia-risk": [
    { h: "The CIA triad" },
    { fig: "cia", cap: "Confidentiality, integrity and availability. Most security work protects one or more of the three." },
    "A useful habit: for any incident, ask which of the three was hurt. Stolen customer data is confidentiality. A changed bank account number on an invoice is integrity. Ransomware usually hurts availability and, when data is stolen first, confidentiality too.",
    { h: "Risk = likelihood × impact" },
    "Organisations can't fix everything, so they rank risks. The simplest way is to score likelihood and impact from 1 to 5 and multiply.",
    { fig: "risk-matrix", cap: "A 5 × 5 risk matrix with three example risks. Each organisation sets its own scales and thresholds." },
    { h: "Four ways to treat a risk" },
    { table: [
      ["Treatment", "Means", "Example"],
      ["Mitigate (reduce)", "Add controls so it's less likely or less damaging", "Patch the VPN, add MFA"],
      ["Transfer", "Make someone else carry the cost", "Cyber insurance, or a contract with a provider"],
      ["Avoid", "Stop doing the risky thing", "Stop storing card numbers at all"],
      ["Accept", "Live with it, on the record, signed off by someone with authority", "A low risk where the fix costs more than the loss"],
    ] },
    { h: "Putting a number on it" },
    "Some organisations estimate risk in money, and Security+ asks about it:",
    { terms: [
      ["SLE (single loss expectancy)", "Cost of one incident = asset value × exposure factor (the share of the value lost)."],
      ["ARO (annual rate of occurrence)", "How many times a year you expect it to happen."],
      ["ALE (annual loss expectancy)", "SLE × ARO: the expected cost per year."],
    ] },
    { table: [
      ["Worked example: stolen laptops", ""],
      ["Asset value (laptop plus the time to handle it)", "$3,000"],
      ["Exposure factor", "100% (the laptop is gone)"],
      ["SLE", "$3,000"],
      ["ARO", "8 a year"],
      ["ALE", "$24,000 a year"],
    ] },
    "If a control costs less per year than the loss it prevents, it usually pays for itself. Full-disk encryption doesn't stop laptops being stolen, but it stops a theft becoming a data breach, which would cost far more.",
    { h: "Kinds of control" },
    { table: [
      ["Type", "Job", "Example"],
      ["Preventive", "Stops it happening", "MFA, firewall rule, locked door"],
      ["Detective", "Notices it happening", "SIEM alert, camera, audit log review"],
      ["Corrective", "Fixes things afterwards", "Restoring from backup, reimaging"],
      ["Deterrent", "Puts people off trying", "Warning banners, visible cameras"],
      ["Compensating", "Stands in when the ideal control isn't possible", "Isolating an old machine that can't be patched"],
      ["Directive", "Tells people what to do", "Policy, sign saying \"authorised staff only\""],
    ], cap: "Controls are also grouped by category: technical (software and hardware), managerial (policy, risk decisions), operational (done by people day to day) and physical." },
    { check: [
      ["A DDoS attack takes the website offline. Which part of the triad is hurt?", "Availability."],
      ["SLE is $50,000 and ARO is 0.2. What's the ALE?", "$10,000 a year."],
      ["What's the difference between accepting a risk and ignoring it?", "Accepting is a recorded decision by someone with authority, ideally reviewed later. Ignoring is not knowing or not deciding."],
    ] },
  ],

  "iam": [
    { h: "Four questions every system asks" },
    { table: [
      ["Step", "Question", "Example"],
      ["Identification", "Who do you claim to be?", "Typing a username"],
      ["Authentication", "Prove it", "Password plus a passkey"],
      ["Authorisation", "What are you allowed to do?", "Read the finance share, not change it"],
      ["Accounting (auditing)", "What did you do?", "Logs of every file opened"],
    ], cap: "Together these are often called AAA (authentication, authorisation, accounting)." },
    { h: "Authentication factors" },
    { table: [
      ["Factor", "Examples"],
      ["Something you know", "Password, PIN, security questions"],
      ["Something you have", "Phone with an authenticator app, security key, smart card"],
      ["Something you are", "Fingerprint, face"],
    ] },
    "Multi-factor authentication (MFA) needs two different kinds. A password plus a security question is still one factor. MFA blocks most attacks that rely on stolen passwords, but not all MFA is equal.",
    { fig: "mfa-ladder", cap: "MFA methods from weakest to strongest. Only passkeys and FIDO2 security keys resist phishing, because they check the website's real address before answering." },
    { note: "Two attacks explain the ranking. In MFA fatigue, an attacker with a password spams push requests until the user taps Approve; number matching stops it. In adversary-in-the-middle phishing, a fake login page passes everything through to the real site and steals the session cookie after MFA; only phishing-resistant methods stop that." },
    { h: "Storing passwords properly" },
    "Systems should never store passwords, only a salted hash made with a slow algorithm built for passwords (Argon2, bcrypt, scrypt or PBKDF2). The salt is random per user, so two people with the same password get different hashes and precomputed tables don't work.",
    "NIST's digital identity guidance (SP 800-63B) changed the old rules: length matters more than complexity, people shouldn't be forced to change passwords on a schedule unless there's a sign of compromise, and new passwords should be checked against lists of breached ones. Password managers make long unique passwords practical.",
    { h: "Single sign-on" },
    "With SSO, people log in once to an identity provider (IdP) such as Microsoft Entra ID, Okta or Google, and every app trusts it. Fewer passwords, MFA in one place, and one switch to turn off when someone leaves.",
    { fig: "sso", cap: "SSO with an identity provider. The app trusts a signed token from the IdP instead of handling passwords itself." },
    { table: [
      ["Standard", "Is for", "Format"],
      ["SAML 2.0", "SSO into business web apps, the older standard", "XML assertions"],
      ["OAuth 2.0", "Authorisation: letting an app act for you (\"allow this app to read your calendar\")", "Access tokens"],
      ["OpenID Connect (OIDC)", "Authentication built on top of OAuth 2.0", "JSON Web Token (JWT) ID tokens"],
    ] },
    { h: "Joiners, movers and leavers" },
    { flow: ["Joiner|accounts and access for the role", "Mover|add new access, remove old", "Leaver|disable everything on the last day"], cap: "Most access problems come from movers who keep old access and leavers whose accounts stay active." },
    { check: [
      ["Is a password plus a PIN multi-factor authentication?", "No. Both are something you know, so it's a single factor."],
      ["Why are passkeys phishing-resistant when app codes aren't?", "A passkey is bound to the real website's domain, so it won't sign in to a look-alike site. A six-digit code can be typed into a fake page and relayed."],
      ["OAuth or OIDC: which one tells an app who the user is?", "OIDC. OAuth on its own is about granting access, not proving identity."],
    ] },
  ],

  "crypto": [
    { h: "Encoding, hashing and encryption" },
    "These three get confused constantly, including in job interviews.",
    { table: [
      ["", "Encoding", "Hashing", "Encryption"],
      ["Purpose", "Make data safe to transport or store", "Fingerprint data; check integrity; store passwords", "Keep data secret"],
      ["Reversible?", "Yes, by anyone", "No, one way only", "Yes, with the key"],
      ["Needs a key?", "No", "No", "Yes"],
      ["Examples", "Base64, URL encoding", "SHA-256, SHA-3, bcrypt", "AES, ChaCha20, RSA"],
    ] },
    { warn: "Base64 is not encryption. Anyone can decode it. Finding a password \"protected\" with Base64 is a real finding in audits." },
    "A hash always comes out the same length, and changing even one letter changes the whole thing:",
    { code: R`SHA-256("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
SHA-256("Hello") = 185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969`, label: "One capital letter, a completely different hash" },
    "That's why investigators share file hashes: if two people get the same SHA-256 for a file, it's the same file.",
    { h: "Symmetric and asymmetric encryption" },
    { fig: "sym-asym", cap: "Symmetric encryption is fast but both sides need the same secret. Asymmetric solves sharing: anyone can use the public key, only the owner has the private key." },
    "Real systems use both. Asymmetric cryptography agrees on a fresh symmetric key at the start of a connection, then fast symmetric encryption carries the data.",
    { h: "Digital signatures" },
    "Signing runs the other way round: the sender hashes the message and signs the hash with their private key. Anyone with the public key can check that it came from them and wasn't changed. Software updates, email (DKIM) and certificates all rely on signatures.",
    { h: "How HTTPS works" },
    { fig: "tls", cap: "A TLS 1.3 handshake, simplified. It takes one round trip before encrypted data can flow." },
    "The certificate proves the server owns the name. It's signed by an intermediate certificate authority, which is signed by a root CA your browser or operating system already trusts. That's the chain of trust. Certificates expire, and an expired or wrong-name certificate is one of the most common outages there is.",
    { h: "Algorithms worth recognising" },
    { table: [
      ["Algorithm", "Kind", "Status"],
      ["AES-128 / AES-256", "Symmetric", "Standard and safe"],
      ["ChaCha20-Poly1305", "Symmetric", "Safe; fast on phones"],
      ["RSA (2048-bit and up), ECC", "Asymmetric", "Safe today; the move to post-quantum has started"],
      ["SHA-256, SHA-3", "Hash", "Safe"],
      ["MD5, SHA-1", "Hash", "Broken for security: collisions can be made. Fine only for spotting accidental corruption"],
      ["DES, 3DES, RC4", "Symmetric", "Retired; finding them is a finding"],
      ["Argon2, bcrypt, scrypt, PBKDF2", "Password hashing", "Use these for stored passwords"],
    ] },
    { note: "Large quantum computers could one day break RSA and ECC. NIST published its first post-quantum standards in 2024 (FIPS 203, 204 and 205), and major browsers already combine a classic key exchange with ML-KEM so that recorded traffic stays safe later." },
    { try: [
      "Open CyberChef and Base64-encode your name, then decode it. Note that no key was involved.",
      "Hash a short text file with `certutil -hashfile file.txt SHA256` (Windows) or `sha256sum file.txt` (Linux). Change one character and hash it again.",
      "In your browser, click the padlock on any HTTPS site and view the certificate chain up to the root.",
    ] },
    { check: [
      ["Is Base64 encryption?", "No. It's encoding: reversible by anyone, no key involved."],
      ["To send Bob a secret with asymmetric encryption, whose key do you use?", "Bob's public key. Only Bob's private key can decrypt it."],
      ["Why are passwords hashed with bcrypt or Argon2 rather than SHA-256?", "They're deliberately slow and salted, so guessing billions of passwords per second against a stolen database isn't practical."],
    ] },
  ],

  "threats": [
    { h: "Who attacks, and why" },
    { table: [
      ["Actor", "Wants", "Typical approach"],
      ["Cybercriminals", "Money", "Ransomware, business email compromise, stealing data to sell"],
      ["Nation-state groups", "Intelligence, sabotage, sometimes money", "Patient, well-funded; target governments, defence, critical infrastructure and their suppliers"],
      ["Hacktivists", "Attention for a cause", "DDoS, defacing websites, leaking data"],
      ["Insiders", "Revenge, money, or nothing (mistakes)", "Misusing access they already have"],
      ["Opportunists", "Whatever is easy", "Automated scans for anything unpatched or exposed"],
    ] },
    { h: "Common attack types" },
    { table: [
      ["Threat", "What it is"],
      ["Phishing", "Fake messages that get people to click, enter a password or open a file. Spear phishing targets one person or team"],
      ["Business email compromise (BEC)", "Taking over or impersonating an email account to redirect payments. Causes some of the largest losses of any crime type"],
      ["Malware", "Viruses, worms, trojans, remote access tools and infostealers that grab saved passwords and browser cookies"],
      ["Ransomware", "Encrypting files and, these days, stealing them first to threaten a leak"],
      ["Social engineering", "Manipulating people by phone (vishing), text (smishing) or in person (tailgating through doors)"],
      ["Denial of service", "Flooding a service so real users can't reach it"],
      ["Supply chain attacks", "Getting in through a trusted vendor, software update or open-source package"],
    ] },
    { h: "Anatomy of a ransomware attack" },
    "Ransomware isn't one event. It's a chain that often takes days or weeks, and every link is a chance to stop it. Reports such as those on The DFIR Report walk through real cases step by step.",
    { fig: "ransomware", cap: "The usual stages of a ransomware intrusion, and the controls that break each link." },
    { h: "Spotting phishing" },
    { ul: [
      "Urgency or fear: \"your account will be closed today\".",
      "A sender name that doesn't match the address, or a reply-to that goes somewhere else.",
      "Links whose real address (hover to see it) isn't the company it claims to be.",
      "Unexpected attachments, especially archives, HTML files or documents asking you to enable content.",
      "Requests to change payment details, buy gift cards or approve an MFA prompt you didn't start.",
    ] },
    { tip: "The best defence after a click is a fast report. Teams that thank people for reporting, rather than shaming them, find out about phishing in minutes instead of weeks." },
    { check: [
      ["What do most ransomware groups do before encrypting?", "Steal data, get admin rights, spread across the network and destroy or disable backups and security tools."],
      ["Someone calls the help desk claiming to be a manager who's locked out and needs an urgent password reset. What's the risk?", "Vishing (voice phishing). The help desk should verify the caller through a known channel before resetting anything."],
      ["What makes BEC different from ordinary phishing?", "It's usually about money transfers: the attacker uses or imitates a real email account to change payment details, often with no malware at all."],
    ] },
  ],

  "vulns": [
    { h: "Naming and scoring" },
    { terms: [
      ["CVE", "A unique ID for one publicly known vulnerability, such as CVE-2026-12345 (year, then a number)."],
      ["CWE", "The type of weakness behind it, such as CWE-79 (cross-site scripting)."],
      ["CVSS", "A 0 to 10 severity score based on how the flaw works."],
      ["EPSS", "A daily estimate of the probability that a CVE will be exploited in the next 30 days."],
      ["KEV", "CISA's Known Exploited Vulnerabilities catalogue: flaws confirmed to be used in real attacks."],
    ] },
    { table: [
      ["CVSS score", "Rating"],
      ["0.1 to 3.9", "Low"],
      ["4.0 to 6.9", "Medium"],
      ["7.0 to 8.9", "High"],
      ["9.0 to 10.0", "Critical"],
    ] },
    { code: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H   →  9.8 Critical", label: "Reading a CVSS vector" },
    "That vector reads: attack vector Network, attack complexity Low, privileges required None, user interaction None, scope Unchanged, and High impact on confidentiality, integrity and availability. In plain words, anyone on the internet can take full control without logging in. CVSS 4.0 (2023) adds more detail, but you'll see 3.1 vectors in advisories for years.",
    { h: "Why CVSS alone isn't enough" },
    "CVSS measures how bad a flaw could be, not how likely it is to hurt you. Most published vulnerabilities are never exploited in the wild, while some medium-scored ones are used in mass attacks. Teams combine severity with real-world signals and their own context.",
    { fig: "vuln-priority", cap: "A simple risk-based way to decide how fast to fix. CISA's SSVC decision trees formalise the same idea." },
    { h: "The vulnerability management cycle" },
    { flow: ["Discover|find every asset", "Scan|Nessus, Qualys, Defender", "Prioritise|exploited? exposed? critical?", "Fix|patch, configure, or mitigate", "Verify|rescan", "Report|trends, overdue items"], loop: "continuously" },
    { tip: "You can't patch what you don't know you have. Asset inventory is the unglamorous first step, and the first two CIS Controls are about exactly that." },
    { check: [
      ["A CVE scores 7.5 but is on the KEV list. Another scores 9.1 but EPSS is very low and it's on an internal test server. Which first?", "The KEV one, because attackers are already using it. The 9.1 still needs fixing, but on its normal schedule."],
      ["What's the difference between a CVE and a CWE?", "A CVE is one specific vulnerability in one product. A CWE is a category of weakness, such as SQL injection, that many CVEs share."],
      ["What does AV:N mean in a CVSS vector?", "Attack vector: Network. It can be exploited remotely."],
    ] },
  ],

  "frameworks": [
    { h: "Why frameworks exist" },
    "A framework is a shared map of what a security programme should cover. It helps teams spot gaps, report progress to leaders and answer customers who ask \"what standard do you follow?\"",
    { h: "NIST Cybersecurity Framework 2.0" },
    { fig: "csf", cap: "NIST CSF 2.0 (2024) has six functions. Govern sits in the middle because it steers the other five." },
    { table: [
      ["Function", "Asks", "Examples"],
      ["Govern", "Who decides, and how do we manage risk?", "Roles, policy, risk appetite, supplier risk"],
      ["Identify", "What do we have and what are the risks?", "Asset inventory, risk assessments"],
      ["Protect", "How do we prevent harm?", "MFA, training, encryption, patching, backups"],
      ["Detect", "How do we notice attacks?", "Logging, SIEM, EDR alerts"],
      ["Respond", "What do we do during an incident?", "Incident plan, containment, communication"],
      ["Recover", "How do we get back to normal?", "Restoring systems, lessons learned"],
    ] },
    { h: "CIS Critical Security Controls" },
    "Where NIST CSF says what to achieve, the CIS Controls (version 8.1) list concrete steps in priority order. Implementation Group 1 (56 safeguards) is basic cyber hygiene that every organisation should do; IG2 and IG3 add more for bigger or higher-risk organisations.",
    { table: [
      ["#", "Control"],
      ["1", "Inventory and control of enterprise assets"],
      ["2", "Inventory and control of software assets"],
      ["3", "Data protection"],
      ["4", "Secure configuration of enterprise assets and software"],
      ["5", "Account management"],
      ["6", "Access control management"],
      ["7", "Continuous vulnerability management"],
      ["8", "Audit log management"],
      ["9", "Email and web browser protections"],
      ["10", "Malware defenses"],
      ["11", "Data recovery"],
      ["12", "Network infrastructure management"],
      ["13", "Network monitoring and defense"],
      ["14", "Security awareness and skills training"],
      ["15", "Service provider management"],
      ["16", "Application software security"],
      ["17", "Incident response management"],
      ["18", "Penetration testing"],
    ] },
    { h: "Others you'll hear about" },
    { table: [
      ["Name", "What it is"],
      ["ISO/IEC 27001:2022", "An international standard for an information security management system; companies get certified by auditors"],
      ["SOC 2", "A US audit report on a service provider's controls, often asked for by customers of SaaS companies"],
      ["PCI DSS v4.0.1", "Rules for anyone who stores, processes or sends payment card data"],
      ["NIST SP 800-53", "A huge catalogue of controls used by US federal systems"],
      ["MITRE ATT&CK", "A catalogue of attacker behaviour, used to plan detections rather than run a programme. See [[mitre|MITRE ATT&CK]]"],
    ] },
    { check: [
      ["Which NIST CSF 2.0 function was new in version 2.0?", "Govern."],
      ["What are the first two CIS Controls, and why are they first?", "Inventory of hardware assets and of software assets. You can't protect what you don't know you have."],
      ["A SaaS customer asks for your SOC 2 report. What are they asking for?", "An independent auditor's report on how well the company's security controls are designed and work."],
    ] },
  ],

  "law-ethics": [
    "Security people get access other staff never see, and the same skills that defend systems can break into them. The law draws a hard line between the two, and it's drawn at permission, not intent.",
    { h: "Laws you should know exist" },
    { table: [
      ["Where", "Law", "Covers"],
      ["Canada", "Criminal Code s. 342.1 and s. 430(1.1)", "Unauthorised use of a computer; mischief to computer data"],
      ["Canada", "PIPEDA", "How private-sector organisations handle personal information, including breach reporting"],
      ["Canada", "Provincial laws such as Quebec's Law 25, and Alberta's and BC's PIPA", "Privacy rules within those provinces"],
      ["US", "Computer Fraud and Abuse Act (18 U.S.C. § 1030)", "Accessing computers without authorisation"],
      ["US", "State breach laws (every state has one), HIPAA for health data", "Who must be told after a breach"],
      ["US", "SEC rules for public companies", "Disclosing a material cyber incident within four business days of deciding it's material"],
      ["UK", "Computer Misuse Act 1990", "Unauthorised access and modification"],
      ["EU", "GDPR", "Personal data; reporting breaches to the regulator within 72 hours where feasible"],
    ] },
    { note: "Canada's federal privacy law is under review. Bill C-36 was introduced in June 2026 to replace PIPEDA's privacy rules with a new law and regulator; check whether it has passed before relying on the details above." },
    { h: "Breach notification in Canada" },
    "Under PIPEDA, an organisation that has a breach of security safeguards involving personal information that creates a real risk of significant harm must report it to the Office of the Privacy Commissioner as soon as feasible, tell the affected people, and keep a record of every breach (even minor ones) for 24 months.",
    { h: "Ethics in practice" },
    "Most security certifications come with a code of ethics. ISC2's, for example, boils down to protecting society, acting honestly and legally, serving your employer or client competently, and advancing the profession. In daily work that looks like:",
    { ul: [
      "Only look at data you need for the task in front of you, even when you can see everything.",
      "Get written permission before testing anything, and stay inside its scope.",
      "Report what you find truthfully, including your own mistakes.",
      "Protect evidence and personal information the same way you'd want yours protected.",
    ] },
    { h: "Grey areas" },
    { table: [
      ["Situation", "What to do"],
      ["You notice a flaw on a company's website by accident", "Stop there; don't dig further to \"confirm\" it. Report it through their security.txt or vulnerability disclosure page"],
      ["A friend asks you to \"check\" their employer's network", "Not without written permission from someone with authority at that employer"],
      ["Your manager asks you to read a colleague's email", "Only through the official process (HR, legal), never as a favour"],
      ["You find a leaked password list online", "Don't log in with any of them. Report through proper channels"],
    ] },
    { warn: "This is general information, not legal advice. Laws differ by country and province, and change. When in doubt, ask your employer's legal team before acting." },
    { check: [
      ["Is accessing a computer \"just to look\", without permission, legal in Canada?", "No. Unauthorised use of a computer is an offence under s. 342.1 of the Criminal Code, whatever the intent."],
      ["How quickly does GDPR expect a reportable breach to reach the regulator?", "Within 72 hours of becoming aware of it, where feasible."],
      ["How long must PIPEDA breach records be kept?", "24 months, for every breach of security safeguards, not only the reportable ones."],
    ] },
  ],
});

Object.assign(window.FIGURES, {
  "did": (g) => {
    const rings = [
      ["People and policy: training, clear rules", ""],
      ["Physical: badges, locks, cameras", "m"],
      ["Perimeter: firewall, email filtering", ""],
      ["Network: segmentation, monitoring", "m"],
      ["Endpoint: EDR, patching, hardening", ""],
      ["Application: secure code, MFA", "m"],
    ];
    const out = [];
    rings.forEach(([label, cls], i) => {
      const x = 20 + i * 40;
      const y = 10 + i * 28;
      out.push(g.rect(x, y, 640 - i * 80, 370 - i * 56, cls, 14), g.text(x + 14, y + 19, label, "s b"));
    });
    out.push(g.box(280, 182, 120, 46, ["!Data", "~encrypt, back up"], "a"));
    return g.svg(680, 390, out);
  },

  "cia": (g) => g.svg(680, 340, [
    g.poly("340,48 170,232 510,232", "o"),
    g.circle(340, 48, 30, "a"), g.text(340, 55, "C", "c h xl"),
    g.circle(170, 232, 30, "t"), g.text(170, 239, "I", "c h xl"),
    g.circle(510, 232, 30, "y"), g.text(510, 239, "A", "c h xl"),
    g.text(340, 168, "every incident hurts", "c s mu"), g.text(340, 184, "at least one of these", "c s mu"),
    g.box(390, 14, 280, 64, ["!Confidentiality", "~only the right people can see it", "~lost in a leak · kept by encryption"], "a"),
    g.box(10, 270, 310, 64, ["!Integrity", "~accurate and unchanged", "~lost to tampering · kept by hashes, signatures"], "t"),
    g.box(360, 270, 310, 64, ["!Availability", "~works when people need it", "~lost to ransomware, DDoS · kept by backups"], "y"),
  ]),

  "risk-matrix": (g) => {
    const out = [];
    const x0 = 130;
    const y0 = 20;
    const cw = 68;
    const ch = 44;
    const lik = ["5 Almost certain", "4 Likely", "3 Possible", "2 Unlikely", "1 Rare"];
    const imp = ["1 Minor", "2 Low", "3 Moderate", "4 Major", "5 Severe"];
    const tone = (s) => (s >= 15 ? "r" : s >= 10 ? "a" : s >= 5 ? "y" : "g");
    for (let r = 0; r < 5; r++) {
      out.push(g.text(x0 - 8, y0 + r * ch + ch / 2 + 2, lik[r], "e s"));
      for (let c = 0; c < 5; c++) {
        const score = (5 - r) * (c + 1);
        out.push(g.box(x0 + c * cw, y0 + r * ch, cw - 4, ch - 4, `^${score}`, tone(score), 4));
      }
    }
    imp.forEach((t, c) => out.push(g.text(x0 + c * cw + (cw - 4) / 2, y0 + 5 * ch + 12, t, "c s")));
    out.push(g.text(x0 + (5 * cw) / 2, y0 + 5 * ch + 34, "Impact →", "c s b"), g.text(x0 - 8, 12, "Likelihood", "e s b"));
    const mark = (r, c, label) => {
      const x = x0 + c * cw + cw - 18;
      const y = y0 + r * ch + 13;
      out.push(g.circle(x, y, 10, "d"), g.text(x, y + 4, label, "c s b iv"));
    };
    mark(1, 4, "R1");
    mark(2, 1, "R2");
    mark(4, 4, "R3");
    const legend = [
      ["R1  Unpatched VPN appliance", "likely × severe = 20: fix now"],
      ["R2  Stolen laptop, encrypted", "possible × low = 6: accept"],
      ["R3  Data centre flood", "rare × severe = 5: insure (transfer)"],
    ];
    legend.forEach(([a, b], i) => out.push(g.text(490, 36 + i * 46, a, "s b"), g.text(490, 52 + i * 46, b, "s mu")));
    [["r", "15–25 critical"], ["a", "10–14 high"], ["y", "5–9 medium"], ["g", "1–4 low"]].forEach(([cls, t], i) => {
      out.push(g.rect(490, 176 + i * 20, 14, 14, cls, 3), g.text(512, 187 + i * 20, t, "s"));
    });
    return g.svg(680, 292, out);
  },

  "mfa-ladder": (g) => {
    const rows = [
      ["Password only", 170, "a", "one leak or guess and they're in"],
      ["SMS or voice code", 240, "a", "SIM swaps, phishing pages"],
      ["Authenticator app code", 310, "y", "better, but can be phished"],
      ["Push with number matching", 380, "y", "stops MFA-fatigue spam"],
      ["Passkey or FIDO2 key", 450, "g", "phishing-resistant"],
    ];
    const out = [];
    rows.forEach(([label, w, cls, note], i) => {
      const y = 16 + i * 46;
      out.push(g.rect(20, y, w, 36, cls, 6), g.text(34, y + 22.5, label, "b s"), g.text(20 + w + 12, y + 22.5, note, `s ${i === 4 ? "gr b" : "mu"}`));
    });
    out.push(g.arrow(20, 256, 470, 256), g.text(480, 260, "stronger", "s b"));
    return g.svg(680, 272, out);
  },

  "sso": (g) => {
    const xs = [90, 340, 590];
    const out = [
      g.box(20, 10, 140, 44, ["!Browser", "~alice"], "d"),
      g.box(260, 10, 160, 44, ["!Payroll app", "~the service provider"], "m"),
      g.box(505, 10, 170, 44, ["!Identity provider", "~Entra ID, Okta, Google"], "a"),
    ];
    xs.forEach((x) => out.push(g.line(x, 54, x, 300, "lf")));
    const msg = (y, a, b, label, cls = "") => {
      const right = xs[b] > xs[a];
      out.push(g.arrow(xs[a] + (right ? 2 : -2), y, xs[b] + (right ? -3 : 3), y, cls));
      out.push(g.text((xs[a] + xs[b]) / 2, y - 7, label, `c s${cls.includes("te") ? " te" : ""}`));
    };
    msg(88, 0, 1, "1  open the payroll app");
    msg(124, 1, 0, "2  redirect: sign in at the IdP", "da");
    msg(170, 0, 2, "3  sign in with password and MFA (once a day)");
    msg(206, 2, 0, "4  signed token (a SAML assertion or OIDC ID token)", "da");
    msg(252, 0, 1, "5  hand the token to the app", "te");
    msg(286, 1, 0, "6  you're in", "te da");
    return g.svg(680, 310, out);
  },

  "sym-asym": (g) => {
    const panel = (x, title, sub, enc, dec, note1, note2, tones) => [
      g.text(x + 160, 22, title, "c b"), g.text(x + 160, 38, sub, "c s mu"),
      g.box(x + 20, 52, 180, 40, ["!Hello Bob", "~plaintext"]),
      g.arrow(x + 110, 92, x + 110, 129), g.text(x + 122, 115, enc, `s b ${tones[0]}`),
      g.box(x + 20, 130, 180, 40, ["`k8Jq2x9FaV…", "~ciphertext"], "m"),
      g.arrow(x + 110, 170, x + 110, 207), g.text(x + 122, 193, dec, `s b ${tones[1]}`),
      g.box(x + 20, 208, 180, 40, ["!Hello Bob", "~plaintext"]),
      g.text(x + 160, 274, note1, "c s"), g.text(x + 160, 290, note2, "c s mu"),
    ];
    return g.svg(680, 302, [
      ...panel(10, "Symmetric", "one shared secret key", "encrypt with key K", "decrypt with the same K",
        "Fast. Carries the actual data (AES).", "Hard part: sharing K safely.", ["ac", "ac"]),
      g.line(340, 10, 340, 296, "lf"),
      ...panel(350, "Asymmetric", "a public and private key pair", "encrypt with Bob's public key", "decrypt with Bob's private key",
        "Slow. Agrees keys and signs (RSA, ECC).", "Anyone can encrypt; only Bob can decrypt.", ["te", "ac"]),
    ]);
  },

  "tls": (g) => {
    const c = 110;
    const s = 570;
    return g.svg(680, 304, [
      g.box(40, 10, 140, 44, ["!Browser", "~the client"], "d"),
      g.box(500, 10, 140, 44, ["!shop.example", "~the server"], "m"),
      g.line(c, 54, c, 300, "lf"), g.line(s, 54, s, 300, "lf"),
      g.arrow(c + 2, 86, s - 3, 86), g.text(340, 79, "ClientHello: TLS versions, cipher suites, key share", "c s"),
      g.arrow(s - 2, 122, c + 3, 122), g.text(340, 115, "ServerHello: chosen cipher, key share", "c s"),
      g.arrow(s - 2, 156, c + 3, 156, "te"), g.text(340, 149, "certificate, signature, Finished (already encrypted)", "c s te"),
      g.box(20, 172, 290, 44, ["!Browser checks the certificate", "~trusted issuer? right name? still valid?"], "y"),
      g.arrow(c + 2, 240, s - 3, 240, "te"), g.text(340, 233, "Finished", "c s te"),
      g.box(c, 258, s - c, 30, "^Both sides share session keys: encrypted HTTP from here on", "t"),
    ]);
  },

  "ransomware": (g) => {
    const rows = [
      ["1  Initial access", "phishing, stolen password, exposed VPN", "MFA, fast patching of internet-facing devices"],
      ["2  Foothold", "malware or a remote access tool runs", "EDR, blocking macros and unknown programs"],
      ["3  Privilege escalation", "gets admin rights", "no everyday admin accounts, LAPS, patching"],
      ["4  Discovery and spread", "maps the network, moves to other machines", "segmentation, alerts on admin tools"],
      ["5  Data theft", "copies files out to use as leverage", "egress monitoring, alerts on big uploads"],
      ["6  Sabotage recovery", "deletes backups, turns off security tools", "immutable or offline backups, tamper protection"],
      ["7  Encryption and extortion", "locks files and demands payment", "tested restore plan, incident response plan"],
    ];
    const out = [g.text(20, 16, "What the attacker does", "b"), g.text(330, 16, "Where defenders can stop it", "b te")];
    rows.forEach(([stage, what, stop], i) => {
      const y = 28 + i * 46;
      out.push(
        g.box(20, y, 280, 40, [`!${stage}`, `~${what}`], i === 6 ? "r" : "a"),
        g.line(300, y + 20, 330, y + 20, "da"),
        g.box(330, y, 340, 40, `^${stop}`, "t"),
      );
    });
    return g.svg(680, 28 + rows.length * 46 + 4, out);
  },

  "vuln-priority": (g) => g.svg(680, 330, [
    g.box(20, 12, 300, 44, ["!New vulnerability on your systems", "~from a scanner, advisory or vendor"], "m"),
    g.arrow(170, 56, 170, 79),
    g.box(20, 80, 300, 48, ["!Is it being exploited in the wild?", "~CISA KEV, vendor or CCCS alert"]),
    g.arrow(320, 104, 399, 104, "ac"), g.text(360, 97, "yes", "c s ac b"),
    g.box(400, 74, 270, 60, ["!Act now", "~patch or mitigate within days", "~and look for signs of compromise"], "r"),
    g.arrow(170, 128, 170, 169), g.text(180, 152, "no", "s b mu"),
    g.box(20, 170, 300, 48, ["!Internet-facing or business-critical?", "~VPN, email, website, domain controllers"]),
    g.arrow(320, 194, 399, 194), g.text(360, 187, "yes", "c s b"),
    g.box(400, 170, 270, 48, ["!Critical or high CVSS,", "!or a high EPSS score?"]),
    g.arrow(535, 218, 535, 261), g.text(545, 244, "yes", "s b"),
    g.box(400, 262, 270, 56, ["!This patch cycle", "~usually within a few weeks"], "y"),
    g.arrow(170, 218, 170, 261), g.text(180, 244, "no", "s b mu"),
    g.path("M402 214 L323 274", "ar"), g.text(374, 252, "no", "s b mu"),
    g.box(20, 262, 300, 56, ["!Normal patch cycle", "~track it; re-check if attacks start"], "g"),
  ]),

  "csf": (g) => g.svg(680, 316, [
    g.circle(340, 168, 64, "d"),
    g.text(340, 160, "GOVERN", "c b iv"), g.text(340, 178, "strategy, roles,", "c s iv"), g.text(340, 193, "policy, oversight", "c s iv"),
    g.box(255, 8, 170, 54, ["!Identify", "~know assets and risks"], "y"),
    g.box(485, 92, 175, 54, ["!Protect", "~MFA, patching, training"], "t"),
    g.box(420, 252, 175, 54, ["!Detect", "~monitoring and alerts"], "a"),
    g.box(85, 252, 175, 54, ["!Respond", "~contain, communicate"], "a"),
    g.box(20, 92, 175, 54, ["!Recover", "~restore and improve"], "g"),
    g.path("M425 36 Q520 40 560 90", "ar"),
    g.path("M580 146 Q590 210 540 250", "ar"),
    g.arrow(420, 279, 262, 279),
    g.path("M150 252 Q100 210 105 148", "ar"),
    g.path("M120 92 Q160 40 253 36", "ar"),
  ]),
});
})();
