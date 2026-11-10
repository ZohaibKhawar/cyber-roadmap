"use strict";

/* Step 3: Operating systems and administration. */
(() => {
const R = String.raw;

Object.assign(window.LESSONS, {
  "systems": [
    "System administrators keep machines running, patched and locked down. Security people need the same skills for a simple reason: you can't spot something wrong on a machine you don't know how to run. Most companies run Windows laptops joined to Active Directory, with Linux on servers and in the cloud, so you need both.",
    { h: "The same job on two systems" },
    "Learn these side by side. Interviewers love asking \"how would you see what's listening on this server?\" for either one.",
    { table: [
      ["Task", "Windows (PowerShell)", "Linux"],
      ["Running processes", "`Get-Process`", "`ps aux`"],
      ["Services", "`Get-Service`", "`systemctl list-units --type=service`"],
      ["Recent logs", "`Get-WinEvent -LogName System -MaxEvents 20`", "`journalctl -n 20`"],
      ["Who am I, which groups", "`whoami /groups`", "`id`"],
      ["Local users", "`Get-LocalUser`", "`cat /etc/passwd`"],
      ["Network settings", "`ipconfig /all`", "`ip a`"],
      ["What's listening", "`Get-NetTCPConnection -State Listen`", "`ss -tulpn`"],
      ["Scheduled jobs", "`Get-ScheduledTask`", "`crontab -l`, `systemctl list-timers`"],
      ["Install software", "`winget install <name>`", "`sudo apt install <name>`"],
      ["Run as admin", "Run as administrator (UAC prompt)", "`sudo <command>`"],
    ] },
    { h: "How to work through this step" },
    { ol: [
      "Get comfortable on the [[linux|Linux]] command line; OverTheWire Bandit makes it a game.",
      "Learn where [[windows|Windows]] keeps its logs and startup items.",
      "Build a domain in your lab and learn [[active-directory|Active Directory]].",
      "Understand [[permissions|users, groups and least privilege]] on both systems.",
      "Finish with [[hardening|patching and hardening]].",
    ] },
    { check: [
      ["How would you list listening ports on a Linux server?", "`ss -tulpn` (or the older `netstat -tulpn`). On Windows, `Get-NetTCPConnection -State Listen` or `netstat -ano`."],
      ["Why do security teams care so much about Active Directory?", "It controls who can log in to almost everything in a Windows company. Whoever controls it controls the company, which is why ransomware groups aim for it."],
    ] },
  ],

  "linux": [
    { h: "Where things live" },
    "Linux keeps everything under one tree that starts at `/`. A few folders matter far more than the rest when you're investigating or securing a machine.",
    { fig: "linux-tree", cap: "The Linux file system. Settings in /etc and logs in /var/log are where most investigations start." },
    { h: "Commands to know cold" },
    { code: R`pwd                         # where am I?
ls -la                      # list everything, including hidden files, with permissions
cd /var/log                 # change folder
less auth.log               # read a file page by page (q to quit)
tail -f syslog              # watch a log as new lines arrive
grep "Failed password" auth.log   # search inside a file
find / -name "*.sh" -mtime -1 2>/dev/null   # .sh files changed in the last day
ps aux                      # every running process
ss -tulpn                   # what's listening, and which program owns it
sudo -l                     # what am I allowed to run as root?`, label: "Linux terminal" },
    { h: "Permissions" },
    "Every file has an owner, a group and three sets of permissions: for the owner, for the group and for everyone else. Each set says whether you can read (r), write (w) and execute (x).",
    { fig: "rwx", cap: "Reading ls -l output. Each set of three letters is a number from 0 to 7, which is how chmod takes them." },
    { table: [
      ["Command", "Does"],
      ["`chmod 640 report.txt`", "Owner reads and writes, group reads, others nothing"],
      ["`chmod u+x script.sh`", "Let the owner run it"],
      ["`chown alice:devs report.txt`", "Change the owner and group"],
      ["`sudo <command>`", "Run one command as root, if you're allowed in /etc/sudoers"],
    ] },
    { note: "Some programs have the SUID bit set (an `s` where the owner's `x` would be), which makes them run as their owner, often root. Auditors list them with `find / -perm -4000 2>/dev/null` because a misconfigured one can hand out root." },
    { h: "Services" },
    "Most modern distributions use systemd to start and supervise services.",
    { code: R`systemctl status ssh          # is it running? recent log lines
sudo systemctl restart ssh    # restart it
sudo systemctl enable ssh     # start it at boot
journalctl -u ssh --since "1 hour ago"   # its logs for the last hour`, label: "systemd" },
    "The SSH service is called `ssh` on Debian and Ubuntu and `sshd` on Red Hat, Fedora and similar.",
    { h: "Reading the login log" },
    "On Debian and Ubuntu, logins and sudo use are written to `/var/log/auth.log`; on Red Hat-style systems it's `/var/log/secure`. This is the first file to open when a Linux server might be compromised.",
    { code: R`2026-11-10T03:12:44.218733+00:00 web01 sshd[48211]: Failed password for invalid user admin from 203.0.113.45 port 52144 ssh2
2026-11-10T03:12:47.902114+00:00 web01 sshd[48211]: Failed password for invalid user admin from 203.0.113.45 port 52144 ssh2
2026-11-10T08:30:02.551930+00:00 web01 sshd[49870]: Accepted publickey for deploy from 198.51.100.23 port 61022 ssh2: ED25519 SHA256:Xk3...
2026-11-10T08:31:15.004211+00:00 web01 sudo:   deploy : TTY=pts/0 ; PWD=/home/deploy ; USER=root ; COMMAND=/usr/bin/systemctl restart nginx`, label: "/var/log/auth.log" },
    "Read it like a story: someone at 203.0.113.45 guessed passwords for a user called `admin` that doesn't exist (normal internet noise), then the `deploy` user logged in with an SSH key and restarted nginx as root (probably normal, but worth confirming if you didn't expect it).",
    { try: [
      "Play OverTheWire Bandit. Each level teaches one command or idea.",
      "On your lab Ubuntu machine, try to SSH in with a wrong password three times, then find those lines in auth.log with `grep`.",
      "Create a user, a group and a shared folder only that group can write to.",
    ] },
    { check: [
      ["What does `chmod 750` give the owner, group and others?", "Owner: read, write, execute (7). Group: read and execute (5). Others: nothing (0)."],
      ["Where are SSH login attempts logged on Ubuntu?", "`/var/log/auth.log` (and in the journal: `journalctl -u ssh`)."],
      ["Why is a file in /tmp worth a second look during an investigation?", "Anyone can write to /tmp, so attackers often drop tools and scripts there."],
    ] },
  ],

  "windows": [
    { h: "The places that matter" },
    { table: [
      ["What", "Where", "Why investigators look"],
      ["Event logs", "Event Viewer; files in `C:\\Windows\\System32\\winevt\\Logs`", "Logins, new services, process starts, cleared logs"],
      ["Registry", "`HKLM` (whole machine) and `HKCU` (current user)", "Settings, and many ways to start programs automatically"],
      ["Run keys", "`HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run` (and the same under HKCU)", "Programs that start when a user logs in"],
      ["Services", "`services.msc`, `Get-Service`", "Run in the background, often as SYSTEM"],
      ["Scheduled tasks", "Task Scheduler, `Get-ScheduledTask`", "A favourite way to survive reboots"],
      ["User folders", "`C:\\Users\\<name>`, including the hidden AppData", "Downloads, browser data, dropped files"],
    ] },
    { h: "Event IDs worth memorising" },
    "Windows writes thousands of event types. These are the ones that come up again and again in SOC work and interviews.",
    { table: [
      ["ID", "Log", "Means"],
      ["4624", "Security", "Successful logon (check the logon type)"],
      ["4625", "Security", "Failed logon"],
      ["4634 / 4647", "Security", "Logoff"],
      ["4648", "Security", "Logon with explicit credentials, such as Run as"],
      ["4672", "Security", "Special privileges assigned: an admin-level logon"],
      ["4688", "Security", "New process created (needs auditing turned on; add command-line logging)"],
      ["4698", "Security", "Scheduled task created"],
      ["4720", "Security", "User account created"],
      ["4728 / 4732 / 4756", "Security", "Member added to a security group (global / local / universal)"],
      ["4740", "Security", "Account locked out"],
      ["1102", "Security", "The audit log was cleared"],
      ["7045", "System", "A new service was installed"],
      ["4104", "PowerShell Operational", "Script block logging: the PowerShell code that ran"],
    ] },
    { table: [
      ["Logon type", "Meaning"],
      ["2", "Interactive: someone at the keyboard"],
      ["3", "Network: accessing a share or service"],
      ["4", "Batch: a scheduled task"],
      ["5", "Service: a service starting"],
      ["7", "Unlock"],
      ["10", "RemoteInteractive: Remote Desktop"],
      ["11", "Cached interactive: logged in with cached domain credentials"],
    ], cap: "The logon type field inside events 4624 and 4625 tells you how someone logged on." },
    { h: "Querying events with PowerShell" },
    { code: R`# The last 20 failed logons (run as administrator)
Get-WinEvent -FilterHashtable @{ LogName = 'Security'; Id = 4625 } -MaxEvents 20 |
  Select-Object TimeCreated, Message

# Services installed in the last 7 days
Get-WinEvent -FilterHashtable @{ LogName = 'System'; Id = 7045; StartTime = (Get-Date).AddDays(-7) }`, label: "PowerShell" },
    { h: "Sysinternals" },
    "Microsoft's free Sysinternals tools show far more than the built-in ones. Analysts use them constantly in labs and on live machines.",
    { table: [
      ["Tool", "Shows"],
      ["Process Explorer", "Every process, its parent, command line, signature and network use"],
      ["Autoruns", "Everything set to start automatically, in one list, with unsigned entries easy to spot"],
      ["Process Monitor", "Every file, registry and process event as it happens"],
      ["TCPView", "Live network connections per process"],
      ["Sysmon", "A service that writes detailed process, network and file events to the event log for your SIEM"],
    ] },
    { try: [
      "On your lab Windows machine, open Event Viewer → Windows Logs → Security.",
      "Lock the screen and type a wrong password twice, then log in. Find the 4625 and 4624 events and compare their logon types.",
      "Run Autoruns as administrator and look at the Logon and Scheduled Tasks tabs.",
    ] },
    { check: [
      ["Which event ID records a failed logon, and which records a new service?", "4625 (Security log) for a failed logon; 7045 (System log) for a new service."],
      ["A 4624 event has logon type 10. What happened?", "Someone logged on through Remote Desktop."],
      ["Why would an attacker clear the Security log, and what event would that leave?", "To hide what they did. Clearing it writes event 1102, which is a strong alert on its own."],
    ] },
  ],

  "active-directory": [
    { h: "What Active Directory is" },
    "Active Directory Domain Services (AD DS) is a database of every user, group and computer in a company, plus the rules for them. Domain controllers hold the database and check every login. Group Policy pushes settings to thousands of machines from one place.",
    { fig: "ad", cap: "A small domain. OUs are folders for organising objects; Group Policy Objects (GPOs) linked to an OU apply to everything inside it." },
    { table: [
      ["Object", "What it is"],
      ["User", "A person or a service account that can log in"],
      ["Computer", "A machine joined to the domain; it has its own account and password too"],
      ["Security group", "A set of users or computers that permissions are given to"],
      ["Organizational unit (OU)", "A container for organising objects and applying Group Policy"],
      ["Group Policy Object (GPO)", "A bundle of settings: password rules, firewall, software, scripts"],
      ["Domain / forest", "A domain is one directory; a forest is one or more domains that trust each other"],
    ] },
    { h: "How Group Policy is applied" },
    "Policies apply in the order Local, Site, Domain, OU (remember LSDOU), and later ones win when they conflict. A GPO linked to the OU a computer sits in beats one linked to the whole domain.",
    { code: R`gpupdate /force      # fetch and apply policy now
gpresult /r          # which GPOs applied to this user and computer`, label: "Command prompt on a domain-joined PC" },
    { h: "Kerberos: logging in without sending your password around" },
    "When you log in to a domain PC, your password never travels to the servers you use. Instead, the domain controller hands out tickets.",
    { fig: "kerberos", cap: "Kerberos, simplified. The ticket-granting ticket (TGT) proves you logged in; service tickets get you into specific servers." },
    "Older Windows systems also use NTLM, a challenge-and-response login that's weaker and easier to abuse. Many organisations are working to switch it off, and Microsoft has announced plans to phase it out.",
    { h: "The keys to the kingdom" },
    { table: [
      ["Group", "Can do"],
      ["Domain Admins", "Anything in the domain"],
      ["Enterprise Admins", "Anything in every domain of the forest"],
      ["Administrators (built-in, on domain controllers)", "Full control of the domain controllers"],
      ["Schema Admins", "Change the structure of the directory itself"],
    ] },
    "Membership of these groups should be tiny and watched closely. A common model splits systems into tiers: tier 0 is anything that controls identity (domain controllers, AD admins), and tier 0 accounts never log in to ordinary laptops where their credentials could be stolen.",
    { warn: "Ransomware groups almost always aim for Domain Admin before encrypting anything, because Group Policy then lets them push ransomware to every machine at once. Alerts on changes to these groups are some of the most valuable a SOC has." },
    { h: "Active Directory and Entra ID" },
    { table: [
      ["", "Active Directory (AD DS)", "Microsoft Entra ID"],
      ["Runs on", "Your own domain controllers", "Microsoft's cloud"],
      ["Speaks", "Kerberos, NTLM, LDAP", "OAuth 2.0, OpenID Connect, SAML over HTTPS"],
      ["Organised with", "OUs and Group Policy", "Groups, Conditional Access, and Intune for device settings"],
      ["Used for", "Windows logins, file shares, on-site apps", "Microsoft 365 and other cloud apps"],
    ] },
    "Most companies run both: Entra Connect copies users from AD to Entra ID, so one password works everywhere. That link means a compromise on one side can spread to the other.",
    { try: [
      "Promote your lab Windows Server to a domain controller for a domain like `lab.local`.",
      "Create OUs for Staff, Workstations and Admins, then a few users and a group.",
      "Join your Windows 11 VM to the domain, log in as a lab user and run `gpresult /r`.",
      "Link a GPO that sets a desktop wallpaper to the Workstations OU and watch it apply.",
    ] },
    { check: [
      ["In what order is Group Policy applied, and which wins?", "Local, Site, Domain, OU. Later policies win, so the OU closest to the object wins."],
      ["What does a Kerberos TGT let you do?", "Ask the domain controller for service tickets without typing your password again, until it expires (10 hours by default)."],
      ["Why shouldn't a Domain Admin log in to an everyday laptop?", "If that laptop is compromised, the attacker can steal the admin's credentials from memory and take over the whole domain."],
    ] },
  ],

  "permissions": [
    { h: "Three principles" },
    { terms: [
      ["Least privilege", "Give each person and program only the access its job needs, and nothing more."],
      ["Need to know", "Even with the right clearance, only see the data your work requires."],
      ["Separation of duties", "No single person can do something risky alone, such as creating and approving a payment."],
    ] },
    { h: "Give permissions to groups, not people" },
    "If permissions are given to individuals, nobody can answer \"who can see the finance share?\" without checking every folder. In Active Directory the classic pattern is AGDLP: put Accounts in Global groups by role, put those in Domain Local groups by resource, and give Permissions to the domain local group.",
    { fig: "agdlp", cap: "AGDLP. When someone joins finance, add them to one group and they get every finance permission; remove them and it's all gone." },
    { h: "Kinds of account" },
    { table: [
      ["Account", "Risk", "Good practice"],
      ["Standard user", "Low", "Everyone's everyday account"],
      ["Local administrator", "Can install anything and read other users' data on that machine", "Not for daily use. Windows LAPS gives every machine a different, rotated local admin password"],
      ["Domain or cloud admin", "Can change everything", "Separate account, used only from admin workstations, with phishing-resistant MFA"],
      ["Service account", "Often powerful, rarely watched, password never changes", "Use group managed service accounts (gMSA) or managed identities; give the minimum rights"],
      ["Shared account", "Nobody knows who did what", "Avoid; if unavoidable, keep it in a password vault with checkout logging"],
      ["Break-glass account", "Emergency access when everything else fails", "Very long password stored offline; alert whenever it's used"],
    ] },
    { h: "Windows file permissions" },
    "A Windows share has two layers: share permissions and NTFS permissions on the files. When someone connects over the network, the more restrictive of the two wins. Many admins set share permissions wide and control everything with NTFS.",
    { h: "Access creeps" },
    "People change jobs and keep their old access. After a few years, long-serving staff often have far more access than anyone intended. Regular access reviews, where managers confirm who still needs what, are the fix, and auditors ask for evidence of them.",
    { check: [
      ["In AGDLP, what gets the actual permission on the folder?", "The domain local group. Users go in global groups, global groups go in domain local groups."],
      ["Why are service accounts a favourite target?", "They often have broad rights, passwords that never change and nobody watching them log in."],
      ["Share permission says Full Control, NTFS says Read. What can a user do over the network?", "Read. The more restrictive of the two applies."],
    ] },
  ],

  "hardening": [
    { h: "Patching is a process" },
    { flow: ["Inventory|know what you have", "Assess|which patches apply, how urgent", "Test|a pilot group first", "Deploy|in rings", "Verify|did it install?", "Report|what's still missing"], loop: "every month, and sooner for emergencies", cap: "A patch management cycle." },
    "Microsoft releases most security updates on Patch Tuesday, the second Tuesday of each month, with emergency fixes outside that when a flaw is being exploited. Updates go out in rings: IT's own machines first, then a pilot group, then everyone, so a bad patch only breaks a few machines.",
    { tip: "Prioritise by real risk, not by count. A flaw on the internet-facing VPN that attackers are already exploiting comes before fifty medium findings on internal laptops. See [[vulns|vulnerabilities and patch priority]]." },
    { h: "Hardening: switch off what you don't need" },
    "Every service, protocol and piece of software is something that can be attacked. Hardening means removing or locking down whatever isn't needed, from a known baseline.",
    { table: [
      ["Setting", "Why"],
      ["Remove local admin rights from users", "Stops most malware from installing itself deeply"],
      ["Disable SMBv1", "An old protocol that famous worms have spread through"],
      ["Require SMB signing", "Blocks relay attacks that pass a stolen login along"],
      ["Turn off LLMNR and NetBIOS name resolution", "Stops attackers on the network answering name lookups and capturing password hashes"],
      ["Windows LAPS", "A unique, rotating local admin password on every machine"],
      ["BitLocker with TPM", "A stolen laptop's disk can't be read"],
      ["Attack surface reduction rules", "Microsoft Defender rules such as blocking Office from creating child processes"],
      ["PowerShell logging", "Script block logging records what ran"],
      ["Host firewall on", "Limits what can connect to each machine"],
    ], cap: "Common Windows hardening steps." },
    { code: R`PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
AllowGroups ssh-users`, label: "Linux: /etc/ssh/sshd_config hardening" },
    "Test the file with `sudo sshd -t` before reloading the service, and keep a second session open while you do. Locking yourself out of a remote server is a rite of passage you can skip.",
    { h: "Baselines" },
    "Nobody hardens hundreds of machines by hand. The CIS Benchmarks are free, detailed baselines for Windows, Linux, browsers, cloud accounts and more. Level 1 settings are safe almost everywhere; Level 2 is stricter and can break things. Tools such as Group Policy, Intune, Ansible or the Microsoft Security Compliance Toolkit apply the baseline, and scanners check for drift.",
    { check: [
      ["When is Patch Tuesday?", "The second Tuesday of each month."],
      ["Why deploy patches in rings?", "So a patch that breaks something only affects a small group before it reaches everyone."],
      ["What's the difference between CIS Level 1 and Level 2?", "Level 1 is a safe baseline for most systems; Level 2 adds stricter settings for high-security environments that may affect how things work."],
    ] },
  ],
});

Object.assign(window.FIGURES, {
  "linux-tree": (g) => {
    const rows = [
      ["/etc", "system-wide settings: passwd, group, ssh/sshd_config, sudoers", true],
      ["/var/log", "logs: auth.log (Debian, Ubuntu) or secure (Red Hat), syslog", true],
      ["/home", "users' files and hidden settings such as .ssh and .bash_history", true],
      ["/root", "the root user's home folder", false],
      ["/tmp", "anyone can write here, so odd files here deserve a look", true],
      ["/usr/bin", "programs (on many distros /bin is a link to it)", false],
      ["/boot", "the kernel and bootloader files", false],
      ["/proc", "a live view of processes and the kernel, not real files", false],
      ["/dev", "devices such as disks and terminals", false],
      ["/opt", "add-on software installed by hand", false],
    ];
    const last = 54 + (rows.length - 1) * 28;
    const out = [g.box(14, 10, 44, 30, "!/", "d"), g.line(36, 40, 36, last)];
    rows.forEach(([dir, desc, hot], i) => {
      const y = 54 + i * 28;
      out.push(g.line(36, y, 56, y), g.text(64, y + 4.5, dir, `mo b${hot ? " ac" : ""}`), g.text(170, y + 4.5, desc, "s"));
    });
    out.push(g.text(64, last + 34, "Orange: places investigators check first", "s ac"));
    return g.svg(680, last + 48, out);
  },

  "rwx": (g) => {
    const chars = ["-", "r", "w", "x", "r", "-", "x", "-", "-", "-"];
    const cls = (i) => (i === 0 ? "m" : i <= 3 ? "a" : i <= 6 ? "t" : "m");
    const out = [g.text(40, 26, "ls -l deploy.sh", "mo s mu")];
    chars.forEach((ch, i) => {
      const x = 40 + i * 38;
      out.push(g.rect(x, 36, 34, 44, cls(i), 5), g.text(x + 17, 65, ch, "c mo xl b"));
    });
    out.push(
      g.text(440, 30, "owner", "s mu"), g.text(510, 30, "group", "s mu"), g.text(575, 30, "file", "s mu"),
      g.text(440, 65, "alice", "mo lg"), g.text(510, 65, "devs", "mo lg"), g.text(575, 65, "deploy.sh", "mo lg"),
      g.path("M40 90 V98 H74 V90"), g.text(57, 118, "type", "c s mu b"), g.text(57, 134, "- file, d folder", "c s mu"),
      g.path("M78 90 V98 H188 V90", "ac"), g.text(133, 118, "owner 4+2+1 = 7", "c s ac b"),
      g.path("M192 90 V98 H302 V90", "te"), g.text(247, 118, "group 4+0+1 = 5", "c s te b"),
      g.path("M306 90 V98 H416 V90"), g.text(361, 118, "others 0", "c s mu b"),
      g.text(440, 110, "r = 4  read", "mo s"), g.text(440, 128, "w = 2  write", "mo s"), g.text(440, 146, "x = 1  execute / enter", "mo s"),
      g.text(40, 182, "chmod 750 deploy.sh", "mo lg b"),
      g.text(232, 182, "owner can do everything, group can read and run, others get nothing", "s mu"),
    );
    return g.svg(680, 198, out);
  },

  "ad": (g) => {
    const ous = [
      [30, ["!OU: Staff", "~users", "`jsmith, apatel"], "m"],
      [190, ["!OU: Workstations", "~computers", "`WS-0142"], "m"],
      [350, ["!OU: Servers", "~member servers", "`FILE01, APP02"], "m"],
      [510, ["!OU: Admins", "~tier 0 accounts", "~tightly protected"], "a"],
    ];
    const gpos = ["browser settings", "BitLocker on", "audit logging", "admin restrictions"];
    const out = [
      g.rect(10, 10, 660, 312, "n", 12),
      g.text(24, 32, "Forest: corp.example.com (a forest can hold several domains)", "s b"),
      g.box(30, 45, 620, 50, ["!Domain: corp.example.com", "~one directory of users, groups, computers and policies"], "d"),
    ];
    ous.forEach(([x, label, cls], i) => {
      out.push(g.line(x + 70, 95, x + 70, 132), g.box(x, 132, 140, 70, label, cls));
      out.push(g.line(x + 70, 202, x + 70, 226, "da"), g.box(x, 226, 140, 40, ["!GPO", `~${gpos[i]}`], "y"));
    });
    out.push(
      g.box(30, 280, 120, 30, "^DC01", "t"), g.arrow(152, 295, 208, 295, "bo"), g.box(210, 280, 120, 30, "^DC02", "t"),
      g.text(345, 291, "domain controllers: store the directory,", "s mu"),
      g.text(345, 307, "copy changes to each other, run Kerberos", "s mu"),
    );
    return g.svg(680, 332, out);
  },

  "kerberos": (g) => {
    const xs = [90, 340, 590];
    const out = [
      g.box(20, 10, 140, 44, ["!Your PC", "~alice logs in"], "d"),
      g.box(260, 10, 160, 44, ["!Domain controller", "~the KDC"], "a"),
      g.box(520, 10, 140, 44, ["!File server", "~FILE01"], "t"),
    ];
    xs.forEach((x) => out.push(g.line(x, 54, x, 300, "lf")));
    const msg = (y, a, b, label, cls = "") => {
      const right = xs[b] > xs[a];
      out.push(g.arrow(xs[a] + (right ? 2 : -2), y, xs[b] + (right ? -3 : 3), y, cls));
      out.push(g.text((xs[a] + xs[b]) / 2, y - 7, label, `c s${cls.includes("te") ? " te" : ""}`));
    };
    msg(88, 0, 1, "1  AS-REQ: log in as alice");
    msg(124, 1, 0, "2  AS-REP: here's a TGT (a day pass)", "da");
    msg(170, 0, 1, "3  TGS-REQ: TGT + \"I need FILE01\"");
    msg(206, 1, 0, "4  TGS-REP: a ticket for FILE01", "da");
    msg(252, 0, 2, "5  AP-REQ: here's my ticket for FILE01", "te");
    msg(286, 2, 0, "6  access granted (alice's password never left her PC)", "te da");
    return g.svg(680, 310, out);
  },

  "agdlp": (g) => g.svg(680, 222, [
    g.box(15, 34, 110, 34, "`alice"), g.box(15, 78, 110, 34, "`bob"), g.box(15, 122, 110, 34, "`chen"),
    g.box(170, 62, 150, 66, ["!GG-Finance", "~global group", "~who: finance staff"], "a"),
    g.box(360, 62, 165, 66, ["!DL-FinShare-Modify", "~domain local group", "~what: change files"], "t"),
    g.box(560, 62, 110, 66, ["!Finance share", "~on FILE01", "~Modify"], "m"),
    g.arrow(125, 51, 169, 84), g.arrow(125, 95, 169, 95), g.arrow(125, 139, 169, 106),
    g.arrow(320, 95, 359, 95), g.arrow(525, 95, 559, 95),
    g.text(70, 188, "A  accounts", "c s b ac"), g.text(245, 188, "G  global groups", "c s b ac"),
    g.text(442, 188, "DL  domain local", "c s b ac"), g.text(615, 188, "P  permission", "c s b ac"),
    g.text(70, 205, "people", "c s mu"), g.text(245, 205, "who they are", "c s mu"),
    g.text(442, 205, "what they can reach", "c s mu"), g.text(615, 205, "on the resource", "c s mu"),
  ]),
});
})();
