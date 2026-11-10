"use strict";

/* Step 2: Networking. Example addresses use the documentation ranges (192.0.2.0/24, 198.51.100.0/24,
   203.0.113.0/24) and private ranges, so none of them point at a real organisation. */
(() => {
const R = String.raw;

Object.assign(window.LESSONS, {
  "networking": [
    "If you can explain what happens when you load a web page, you understand networking well enough to start in security. It's also one of the most common interview questions, so it's worth learning this one picture really well.",
    { fig: "pageload", cap: "Loading https://shop.example on a home network. Steps 1 and 2 happen once when you join the network; steps 3 to 6 happen for every new site." },
    { h: "Every step leaves evidence" },
    "Security teams rarely see packets. They see logs that each of these steps produces. Knowing which step makes which log tells you where to look during an investigation.",
    { table: [
      ["Step", "Protocol", "What a defender can see"],
      ["1", "DHCP", "Which device had which IP address, and when. Without this you can't tell which laptop was `10.0.10.37` yesterday afternoon."],
      ["2", "ARP", "Usually nothing. Some switches alert on ARP spoofing."],
      ["3", "DNS", "Every domain a device looked up. One of the best places to spot malware calling home."],
      ["4", "TCP", "Firewall logs: source, destination, port, allowed or blocked, bytes sent."],
      ["5", "TLS", "The site name (SNI) and certificate, even though the content is encrypted."],
      ["6", "HTTP", "Proxy or web server logs: URLs, status codes, user agents."],
    ] },
    { h: "How to work through this step" },
    { ol: [
      "[[net-models|OSI and TCP/IP models]] give you the vocabulary.",
      "[[subnetting|IP addressing and subnetting]] is the maths; practise until it's automatic.",
      "[[protocols|Ports and protocols]] are what you'll read in every log.",
      "[[routing|Routing, switching and VLANs]] and [[netsec|firewalls, VPNs and NAT]] show how networks are divided and guarded.",
      "[[packets|Packet captures]] let you check all of the above with your own eyes.",
    ] },
    { tip: "Practise the interview answer out loud: start at the keyboard and end at the rendered page, naming each protocol. Two minutes is about right." },
    { check: [
      ["Why do investigators need DHCP logs?", "IP addresses change. DHCP logs map an IP address at a given time to a specific device (by its MAC address and hostname)."],
      ["HTTPS hides the page content. What can a defender still see?", "The IP addresses and ports, the timing and size of traffic, the DNS lookup, and the server name and certificate from the TLS handshake."],
    ] },
  ],

  "net-models": [
    { h: "Why networks are described in layers" },
    "Sending a message across the world involves cables, radio, addressing, retries, encryption and the application itself. Layers split that work up so each piece only worries about its own job. It also gives everyone shared words: \"it's a layer 2 problem\" tells a colleague to look at switches and VLANs, not the firewall.",
    { fig: "osi", cap: "The 7-layer OSI model is used for talking about problems. The 4-layer TCP/IP model is how the internet is actually built. They describe the same thing." },
    { tip: "To remember the OSI layers from 1 up: Please Do Not Throw Sausage Pizza Away (Physical, Data link, Network, Transport, Session, Presentation, Application)." },
    { h: "Encapsulation: envelopes inside envelopes" },
    "As data goes down the layers on the sender, each layer wraps it in its own header. The receiver unwraps them in reverse. That's why a firewall can filter on IP addresses (layer 3) and ports (layer 4) without understanding the application inside.",
    { fig: "encap", cap: "One web request on its way out. Each layer adds a header; the data unit has a different name at each layer." },
    { h: "TCP and UDP" },
    { table: [
      ["", "TCP", "UDP"],
      ["Connection", "Sets up a connection first (handshake)", "Just sends"],
      ["Reliability", "Numbers every byte, resends anything lost, keeps order", "No guarantees"],
      ["Speed", "Slower to start", "Fast and light"],
      ["Used by", "Web (HTTP/HTTPS), SSH, RDP, SMB, email", "DNS lookups, DHCP, VoIP, video calls, games, QUIC (HTTP/3)"],
    ] },
    { h: "The three-way handshake" },
    { fig: "handshake", cap: "TCP's three-way handshake. Each side picks a starting sequence number and confirms the other's by adding one." },
    "Closing is polite too: each side sends FIN and the other acknowledges it. A reset (RST) slams the connection shut, for example when nothing is listening on that port.",
    { note: "Security tools watch handshakes. One address sending SYNs to hundreds of ports with no follow-up is a port scan. Thousands of SYNs that never finish can be a SYN flood, a kind of denial of service." },
    { h: "Problems described by layer" },
    { table: [
      ["Symptom", "Layer", "Where to look"],
      ["Cable unplugged, no Wi-Fi signal", "1 Physical", "Cables, ports, wireless"],
      ["Device in the wrong VLAN", "2 Data link", "Switch port settings"],
      ["Wrong IP address or gateway", "3 Network", "IP settings, DHCP, routing"],
      ["Firewall blocking port 443", "4 Transport", "Firewall rules and logs"],
      ["Expired certificate, app error", "7 Application (often just \"the app\")", "Browser, server and app logs"],
    ] },
    { check: [
      ["At which layer do routers work, and what address do they use?", "Layer 3, the network layer. They forward packets using IP addresses."],
      ["Name the three packets of the TCP handshake in order.", "SYN, SYN-ACK, ACK."],
      ["Why does DNS mostly use UDP?", "A lookup is one small question and one small answer. Setting up a TCP connection first would make every lookup slower. DNS falls back to TCP for large answers and zone transfers."],
    ] },
  ],

  "subnetting": [
    { h: "An IPv4 address is 32 bits" },
    "An IPv4 address is four numbers from 0 to 255, each made of 8 bits (an octet). The prefix length after the slash says how many bits, counted from the left, belong to the network. The rest identify one device on that network.",
    { fig: "ip-bits", cap: "192.168.10.37/24: the first 24 bits name the network and the last 8 name the device." },
    { h: "Binary in one minute" },
    "Each bit in an octet has a value. Add up the values of the bits that are 1.",
    { table: [
      ["Bit value", "128", "64", "32", "16", "8", "4", "2", "1"],
      ["168 in binary", "1", "0", "1", "0", "1", "0", "0", "0"],
      ["37 in binary", "0", "0", "1", "0", "0", "1", "0", "1"],
    ], cap: "168 = 128 + 32 + 8, and 37 = 32 + 4 + 1." },
    { h: "Cheat sheet" },
    "Addresses in a subnet = 2 to the power of (32 minus the prefix). Usable hosts are two fewer, because the first address names the network and the last is the broadcast address.",
    { table: [
      ["Prefix", "Mask", "Addresses", "Usable hosts", "Typical use"],
      ["/32", "255.255.255.255", "1", "1", "One machine in a firewall rule"],
      ["/30", "255.255.255.252", "4", "2", "A link between two routers"],
      ["/29", "255.255.255.248", "8", "6", "A handful of servers"],
      ["/28", "255.255.255.240", "16", "14", ""],
      ["/27", "255.255.255.224", "32", "30", ""],
      ["/26", "255.255.255.192", "64", "62", ""],
      ["/25", "255.255.255.128", "128", "126", ""],
      ["/24", "255.255.255.0", "256", "254", "A typical office VLAN"],
      ["/23", "255.255.254.0", "512", "510", ""],
      ["/22", "255.255.252.0", "1,024", "1,022", "A large site"],
      ["/16", "255.255.0.0", "65,536", "65,534", "A whole campus or cloud network"],
      ["/8", "255.0.0.0", "16,777,216", "16,777,214", "All of 10.x.x.x"],
    ] },
    { h: "Worked example: which subnet is 10.20.30.77/27 in?" },
    { ol: [
      "A /27 mask is 255.255.255.224. The interesting octet is the last one.",
      "Block size = 256 − 224 = 32. Subnets start at multiples of 32: 0, 32, 64, 96, 128 and so on.",
      "77 sits between 64 and 95, so the network address is **10.20.30.64**.",
      "The broadcast address is the last one in the block: **10.20.30.95**.",
      "Usable hosts are **10.20.30.65 to 10.20.30.94** (30 of them).",
    ] },
    { h: "Addresses with special meanings" },
    { table: [
      ["Range", "Meaning", "Why you care"],
      ["10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16", "Private (RFC 1918). Not routed on the internet.", "An alert from one of these came from inside a network"],
      ["127.0.0.0/8", "Loopback, the machine talking to itself", "Services bound here can't be reached from outside"],
      ["169.254.0.0/16", "Link-local: DHCP failed", "A quick sign of a network problem"],
      ["100.64.0.0/10", "Carrier-grade NAT used by ISPs", "Not really your public address"],
      ["192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24", "Reserved for documentation", "Safe for examples, like the ones on this site"],
      ["0.0.0.0/0", "Every IPv4 address", "In an inbound firewall rule it means \"the whole internet\""],
    ] },
    { tip: "172.16.0.0/12 runs from 172.16.0.0 to 172.31.255.255. So 172.20.5.4 is private but 172.40.5.4 is not." },
    { h: "IPv6 basics" },
    "IPv6 addresses are 128 bits written as eight groups of hexadecimal. Two shortcuts make them readable: drop leading zeros in each group, and replace one run of all-zero groups with `::`.",
    { code: "2001:0db8:0000:0000:0000:ff00:0042:8329\n2001:db8::ff00:42:8329          (the same address, shortened)", label: "IPv6 shortening" },
    { table: [
      ["Prefix", "Type", "Like IPv4's"],
      ["2000::/3", "Global unicast: public addresses", "Public addresses"],
      ["fc00::/7", "Unique local", "Private ranges"],
      ["fe80::/10", "Link-local, on every interface", "169.254.x.x"],
      ["::1", "Loopback", "127.0.0.1"],
      ["2001:db8::/32", "Documentation", "203.0.113.0/24"],
    ] },
    "Subnets are almost always /64. IPv6 usually has no NAT, so every device can have a public address, and firewall rules matter even more.",
    { warn: "IPv6 is switched on by default in Windows, macOS and Linux. Networks that only monitor and filter IPv4 can miss traffic that quietly uses IPv6." },
    { try: [
      "Pick a random address and prefix, such as 172.18.200.9/21. Work out the network address, broadcast address and number of usable hosts.",
      "Check yourself with an online subnet calculator.",
      "Do five a day for two weeks. Speed comes from repetition, not cleverness.",
    ] },
    { check: [
      ["How many usable hosts are in a /26?", "62 (64 addresses minus the network and broadcast addresses)."],
      ["Which network does 192.168.1.130/25 belong to?", "192.168.1.128/25. The block size is 128, and 130 falls in the second block (128 to 255)."],
      ["Is 172.31.4.9 a private address?", "Yes. It's inside 172.16.0.0/12, which covers 172.16.0.0 to 172.31.255.255."],
      ["Shorten 2001:0db8:0000:0000:0000:0000:0000:0001.", "2001:db8::1"],
    ] },
  ],

  "protocols": [
    { h: "Ports in one sentence" },
    "An IP address gets data to the right computer; a port number gets it to the right program. Servers listen on well-known ports (0 to 1023 are reserved for common services), while clients pick a random high port for each connection.",
    { h: "The ones you'll see every day" },
    { table: [
      ["Port", "Protocol", "What it's for", "Clear text?", "Why defenders care"],
      ["20, 21 TCP", "FTP", "File transfer", "Yes", "Passwords travel unencrypted"],
      ["22 TCP", "SSH / SFTP", "Remote shell and file transfer", "No", "Brute-forced constantly if open to the internet"],
      ["23 TCP", "Telnet", "Old remote shell", "Yes", "Should not exist on modern networks"],
      ["25, 587 TCP", "SMTP", "Sending email (587 for clients)", "Can be either", "Spam relays, phishing"],
      ["53 UDP/TCP", "DNS", "Name lookups", "Usually yes", "Malware uses DNS to find its servers"],
      ["67, 68 UDP", "DHCP", "Handing out IP addresses", "Yes", "Rogue DHCP servers can redirect traffic"],
      ["80 TCP", "HTTP", "Web", "Yes", "Anything sent can be read on the way"],
      ["88 TCP/UDP", "Kerberos", "Windows domain logins", "No", "Ticket attacks against Active Directory"],
      ["123 UDP", "NTP", "Time sync", "Yes", "Wrong clocks break logs and Kerberos"],
      ["161 UDP", "SNMP", "Monitoring network devices", "v1 and v2c, yes", "Default \"public\" community strings leak config"],
      ["389, 636 TCP", "LDAP, LDAPS", "Directory lookups (Active Directory)", "389 can be", "Reveals users and groups"],
      ["443 TCP (and UDP for QUIC)", "HTTPS", "Encrypted web", "No", "Most traffic, including malware, hides here"],
      ["445 TCP", "SMB", "Windows file sharing", "Depends on version", "Ransomware spreads over it; never expose it to the internet"],
      ["514 UDP", "Syslog", "Sending logs", "Yes", "Logs can be spoofed or read in transit"],
      ["1433, 3306, 5432 TCP", "SQL Server, MySQL, PostgreSQL", "Databases", "Can be", "Databases should never face the internet"],
      ["3389 TCP", "RDP", "Windows remote desktop", "No (encrypted)", "A top way in for ransomware when exposed"],
      ["5985, 5986 TCP", "WinRM", "PowerShell remoting", "5985 is HTTP", "Admins and attackers both use it to run commands"],
    ] },
    { warn: "If you ever see 3389 (RDP), 445 (SMB), 23 (Telnet) or a database port reachable from the whole internet, treat it as urgent. These are among the most attacked services there are." },
    { h: "How DNS finds an address" },
    { fig: "dns", cap: "A DNS lookup for shop.example.com. Your laptop asks one question; the resolver does the legwork and caches the answer." },
    { table: [
      ["Record", "Holds", "Example"],
      ["A / AAAA", "IPv4 / IPv6 address", "`shop.example.com → 203.0.113.10`"],
      ["CNAME", "An alias for another name", "`www → shop.example.com`"],
      ["MX", "Mail servers for the domain", "`10 mail.example.com`"],
      ["TXT", "Free text, including SPF, DKIM and DMARC email security", "`v=spf1 include:_spf.example.net -all`"],
      ["NS", "The domain's name servers", "`ns1.example.com`"],
      ["PTR", "Reverse lookup: IP to name", "`10.113.0.203.in-addr.arpa → shop.example.com`"],
    ] },
    { h: "How DHCP hands out an address" },
    { flow: ["Discover|\"Any DHCP servers?\"", "Offer|\"Take 192.168.1.50\"", "Request|\"I'll take it\"", "Acknowledge|\"It's yours for 24 hours\""], cap: "DORA: the four DHCP messages. The lease also tells the device its gateway and DNS servers." },
    { h: "What an HTTP request looks like" },
    { code: R`GET /account HTTP/1.1
Host: shop.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Cookie: session=4f9c2e...

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Set-Cookie: session=4f9c2e...; Secure; HttpOnly; SameSite=Lax`, label: "Request, then response" },
    { table: [
      ["Status", "Meaning", "Seen in logs as a sign of"],
      ["200", "OK", "Normal success"],
      ["301 / 302", "Moved, go here instead", "Redirects, including to login pages"],
      ["401", "Not logged in", "Many in a row: password guessing"],
      ["403", "Logged in but not allowed", "Someone poking at things they can't reach"],
      ["404", "Not found", "Hundreds from one IP: a scanner looking for files"],
      ["500", "Server error", "A bug, or input the app didn't expect"],
    ] },
    { h: "Clear-text protocols and their safer versions" },
    { table: [
      ["Avoid", "Use instead"],
      ["Telnet (23)", "SSH (22)"],
      ["FTP (21)", "SFTP (over SSH) or FTPS"],
      ["HTTP (80)", "HTTPS (443)"],
      ["LDAP (389) without signing", "LDAPS (636) or LDAP with signing and channel binding"],
      ["SNMP v1 and v2c", "SNMPv3"],
      ["POP3 (110), IMAP (143)", "POP3S (995), IMAPS (993)"],
    ] },
    { check: [
      ["What runs on port 445 and why should it never face the internet?", "SMB, Windows file sharing. It has a long history of serious vulnerabilities and ransomware has used it to spread."],
      ["Which DNS record type holds an email domain's SPF policy?", "TXT."],
      ["Hundreds of 404 responses to one IP address in a minute suggest what?", "Automated scanning: a tool trying lots of paths to find hidden files or admin pages."],
    ] },
  ],

  "routing": [
    { h: "Switches and MAC addresses" },
    "Every network card has a MAC address, a 48-bit hardware address such as `00:1A:2B:3C:4D:5E`. The first half identifies the maker. A switch learns which MAC address sits behind each of its ports and only forwards frames where they need to go. Switches work at layer 2 and stay inside one local network.",
    { h: "ARP: from IP address to MAC address" },
    "To send to an IP address on the same subnet, a computer needs its MAC address. ARP asks the whole local network \"who has 192.168.1.1?\" and the owner replies. Answers are cached.",
    { code: R`C:\> arp -a

Interface: 192.168.1.50 --- 0x7
  Internet Address      Physical Address      Type
  192.168.1.1           a4-2b-b0-11-22-33     dynamic
  192.168.1.20          3c-52-82-44-55-66     dynamic`, label: "Windows ARP cache" },
    { note: "ARP has no authentication, so anyone on the local network can claim to be the router (ARP spoofing). Managed switches can block this with features such as Dynamic ARP Inspection." },
    { h: "Routers and the default gateway" },
    "Before sending anything, a computer asks one question: is the destination in my subnet? If yes, it delivers it directly. If not, it sends it to the default gateway, the router, which looks up the best route.",
    { code: R`$ ip route
default via 192.168.1.1 dev eth0
10.8.0.0/24 via 10.8.0.1 dev tun0
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.50`, label: "A Linux routing table" },
    "When more than one route matches, the most specific one (the longest prefix) wins. Here, traffic to `10.8.0.5` goes through the VPN tunnel (`tun0`), traffic to `192.168.1.20` goes straight out of `eth0`, and everything else goes to the gateway.",
    { h: "VLANs split one switch into several networks" },
    { fig: "vlans", cap: "Two VLANs on one switch. Devices in different VLANs can only talk through the router or firewall, which is where rules are enforced." },
    { terms: [
      ["Access port", "A switch port in one VLAN, for a single device such as a PC."],
      ["Trunk port", "A link that carries several VLANs, each frame tagged with its VLAN number (802.1Q)."],
      ["Inter-VLAN routing", "Moving traffic between VLANs through a router, firewall or layer 3 switch."],
    ] },
    { h: "Why segmentation is a security control" },
    "On a flat network, one infected laptop can reach every server. Segmenting means an attacker has to get through a firewall rule for every hop, which slows them down and creates logs.",
    { table: [
      ["Segment", "Holds", "Typical rule"],
      ["Staff", "Laptops and desktops", "Web out; only the servers they need in the server zone"],
      ["Servers", "File, app and database servers", "Only the specific ports each app needs"],
      ["Management", "Admin interfaces of switches, firewalls, hypervisors", "Reachable only from admin jump hosts"],
      ["Guest Wi-Fi", "Visitors' devices", "Internet only, nothing internal"],
      ["IoT and printers", "Cameras, printers, smart TVs", "Locked down; often poorly patched"],
      ["Payment (PCI)", "Card-processing systems", "Strictly isolated to shrink the audit scope"],
    ] },
    { check: [
      ["What does ARP do?", "It finds the MAC address that belongs to an IP address on the local network."],
      ["A PC at 10.0.10.21/24 sends to 10.0.20.10. Where does the packet go first?", "To its default gateway, because 10.0.20.10 is outside its own 10.0.10.0/24 subnet."],
      ["Why put printers and cameras in their own VLAN?", "They're often poorly patched. Isolating them stops an attacker who compromises one from reaching laptops and servers."],
    ] },
  ],

  "netsec": [
    { h: "How a firewall decides" },
    "A stateful firewall remembers connections. If an inside laptop opens a connection out, the reply is let back in automatically; you only write rules for who may start a connection. Rules are read top to bottom and the first match wins. Anything that matches no rule is dropped: the implicit deny.",
    { table: [
      ["#", "From", "To", "Port", "Action", "Why"],
      ["1", "Internet", "Web server (DMZ)", "443", "Allow", "The public website"],
      ["2", "Staff LAN", "Internet", "80, 443", "Allow", "Browsing"],
      ["3", "Web server", "Database", "5432", "Allow", "The app needs its data"],
      ["4", "Admin jump host", "Server zone", "22, 3389", "Allow", "Admin access from one controlled place"],
      ["5", "Any", "Any", "Any", "Deny and log", "Everything else"],
    ], cap: "A small rule set. Order matters: a broad Allow above a narrow Deny would let the traffic through." },
    { fig: "dmz", cap: "A DMZ holds the servers the internet must reach, so a compromised web server still can't reach staff laptops." },
    { h: "NAT" },
    "Network address translation lets many devices with private addresses share one public address. The router rewrites each outgoing packet and remembers which inside device it belongs to.",
    { table: [
      ["Inside (private)", "Outside (what the internet sees)", "Destination"],
      ["192.168.1.50:51544", "198.51.100.7:40001", "203.0.113.10:443"],
      ["192.168.1.62:49822", "198.51.100.7:40002", "203.0.113.10:443"],
    ], cap: "Port address translation: two laptops share one public IP; the router tells them apart by port." },
    "Port forwarding does the opposite: it sends traffic arriving on a public port to an inside machine. It's how home users expose a game server, and how a forgotten rule exposes RDP to the whole internet.",
    { h: "VPNs" },
    { table: [
      ["Type", "Connects", "Example"],
      ["Site-to-site", "Two networks, permanently", "A branch office to head office over IPsec"],
      ["Remote access", "One user's device to the company network", "A laptop on hotel Wi-Fi using an SSL VPN or WireGuard"],
    ] },
    "A full-tunnel VPN sends all of the user's traffic through the company; split tunnel sends only company traffic and lets the rest go straight out. Split tunnel is faster but the company sees less.",
    { warn: "VPN gateways and firewalls face the internet, so attackers hunt for flaws in them. Edge devices from many vendors appear on CISA's Known Exploited Vulnerabilities list again and again. Patch them fast and require MFA for VPN logins." },
    { h: "Other devices on the path" },
    { table: [
      ["Device", "What it does"],
      ["Proxy / web filter", "Makes web requests on users' behalf; blocks categories and logs every URL"],
      ["WAF (web application firewall)", "Sits in front of a web app and blocks attacks such as SQL injection in requests"],
      ["IDS", "Watches traffic and alerts on known bad patterns"],
      ["IPS", "Like an IDS, but sits in line and can block"],
      ["Next-generation firewall", "A firewall that also knows applications and users and includes IPS features"],
      ["NDR", "Network detection and response: looks for odd behaviour in traffic, not just signatures"],
    ] },
    { h: "Zero trust" },
    "Old networks trusted anything inside the firewall. Zero trust drops that idea: every request has to prove who the user is, that the device is healthy and that access makes sense, wherever it comes from. NIST SP 800-207 is the usual reference. In practice it looks like strong identity, MFA, device checks and small network segments, not a single product.",
    { check: [
      ["A rule set ends without an explicit Deny. Is unmatched traffic allowed?", "No. Firewalls drop traffic that matches no rule (the implicit deny). An explicit deny-and-log rule at the end is still useful so blocked traffic gets logged."],
      ["Why put a public web server in a DMZ instead of the staff LAN?", "If it's compromised, the attacker is stuck in the DMZ; firewall rules stop them reaching staff machines and internal servers."],
      ["What's the risk of a port forward for 3389?", "It exposes Remote Desktop to the whole internet, where it will be password-guessed and targeted with exploits."],
    ] },
  ],

  "packets": [
    "A packet capture is a recording of every packet that crossed a network interface. Logs summarise what happened; a capture shows exactly what happened. Wireshark is the graphical tool everyone uses, tcpdump is the command-line one, and both read and write `.pcap` and `.pcapng` files.",
    { warn: "Only capture on networks you own or are allowed to monitor. Captures can contain passwords, cookies and personal data, so store and share them carefully." },
    { h: "Capturing with tcpdump" },
    { code: R`# list the interfaces you can capture on
sudo tcpdump -D

# capture DNS traffic on eth0 into a file
sudo tcpdump -i eth0 -w dns.pcap port 53

# read it back, without turning IPs into names
tcpdump -n -r dns.pcap`, label: "Linux terminal" },
    { h: "Capture filters and display filters" },
    "Capture filters decide what gets recorded (use them on busy networks). Display filters hide and show packets you already have. They use different syntax, which trips everyone up at first.",
    { table: [
      ["Goal", "Capture filter (BPF)", "Wireshark display filter"],
      ["One host", "`host 10.0.0.5`", "`ip.addr == 10.0.0.5`"],
      ["One port", "`port 443`", "`tcp.port == 443`"],
      ["DNS only", "`port 53`", "`dns`"],
      ["Exclude noise", "`not arp`", "`!(arp or dns)`"],
    ] },
    { table: [
      ["Display filter", "Shows"],
      ["`http.request`", "Every HTTP request"],
      ["`http.request.method == \"POST\"`", "Form submissions and uploads"],
      ["`tls.handshake.type == 1`", "TLS Client Hellos, which include the server name"],
      ["`tls.handshake.extensions_server_name contains \"example\"`", "TLS connections to a name you're interested in"],
      ["`tcp.flags.syn == 1 && tcp.flags.ack == 0`", "New connection attempts (useful for spotting scans)"],
      ["`dns.qry.name contains \"example\"`", "DNS lookups for a domain"],
    ] },
    { h: "What a page load looks like" },
    { code: R`No.  Source         Destination    Protocol  Info
1    192.168.1.50   1.1.1.1        DNS       Standard query 0x3f2a A shop.example
2    1.1.1.1        192.168.1.50   DNS       Standard query response 0x3f2a A shop.example A 203.0.113.10
3    192.168.1.50   203.0.113.10   TCP       51544 → 443 [SYN] Seq=0 Win=64240
4    203.0.113.10   192.168.1.50   TCP       443 → 51544 [SYN, ACK] Seq=0 Ack=1
5    192.168.1.50   203.0.113.10   TCP       51544 → 443 [ACK] Seq=1 Ack=1
6    192.168.1.50   203.0.113.10   TLSv1.3   Client Hello (SNI=shop.example)
7    203.0.113.10   192.168.1.50   TLSv1.3   Server Hello, Change Cipher Spec, Application Data
8    192.168.1.50   203.0.113.10   TLSv1.3   Application Data`, label: "Wireshark packet list (trimmed)" },
    "Packets 1 and 2 are the DNS lookup, 3 to 5 are the TCP handshake (Wireshark shows sequence numbers relative to the start, so they begin at 0) and 6 onward is TLS. After the Server Hello everything is encrypted.",
    { h: "Menus worth knowing" },
    { table: [
      ["Menu", "Use it to"],
      ["Analyze → Follow → TCP Stream", "Read a whole conversation as text (great for HTTP, useless for TLS)"],
      ["Statistics → Conversations", "See who talked to whom and how much data moved"],
      ["Statistics → Protocol Hierarchy", "Get a quick picture of what's in a big capture"],
      ["File → Export Objects → HTTP", "Pull out files that were downloaded over plain HTTP"],
    ] },
    { h: "What investigators look for" },
    { ul: [
      "**Beaconing:** small connections to the same address at regular intervals, like every 60 seconds.",
      "**Odd DNS:** lookups for long random-looking names, or far more lookups than normal.",
      "**Big uploads** to a host the company has never used.",
      "**Clear text** credentials in HTTP, FTP or Telnet.",
      "**Unusual ports** or protocols on a port they don't belong to.",
    ] },
    { try: [
      "Start Wireshark on your own computer and begin a capture.",
      "Visit a website you haven't opened today, then stop the capture.",
      "Filter on `dns` and find the lookup. Then filter on `tls.handshake.type == 1` and find the Client Hello with the same name.",
      "Right-click the first packet of that TCP connection, choose Conversation Filter → TCP, and find the three handshake packets.",
    ] },
    { check: [
      ["Which filter type do you use to keep a capture small on a busy network?", "A capture filter (BPF syntax), because it decides what gets recorded in the first place."],
      ["Why doesn't Follow TCP Stream show readable text for HTTPS?", "The content is encrypted by TLS. You'd only see it with the session keys."],
      ["A laptop connects to the same unknown IP address every 300 seconds, sending about 200 bytes each time. What might that be?", "Beaconing: possibly malware checking in with its command-and-control server. It deserves a closer look."],
    ] },
  ],
});

Object.assign(window.FIGURES, {
  "pageload": (g) => {
    const xs = [80, 250, 430, 600];
    const heads = [["!Your laptop", "`192.168.1.50"], ["!Home router", "`192.168.1.1"], ["!DNS resolver", "`1.1.1.1"], ["!Web server", "`203.0.113.10"]];
    const out = [];
    heads.forEach((h, i) => out.push(g.box(xs[i] - 70, 10, 140, 44, h, i === 0 ? "d" : "m"), g.line(xs[i], 54, xs[i], 395, "lf")));
    const msg = (y, a, b, label, cls = "", two = false) => {
      const right = xs[b] > xs[a];
      out.push(g.arrow(xs[a] + (right ? 2 : -2), y, xs[b] + (right ? -3 : 3), y, `${two ? "bo " : ""}${cls}`));
      const tone = cls.includes("ac") ? " ac" : cls.includes("te") ? " te" : "";
      out.push(g.text(Math.min(xs[a], xs[b]) + 10, y - 7, label, `s${tone}`));
    };
    msg(88, 0, 1, "1  DHCP: get an address", "", true);
    msg(128, 0, 1, "2  ARP: router's MAC?", "", true);
    msg(172, 0, 2, "3  DNS: IP of shop.example?", "te");
    msg(200, 2, 0, "203.0.113.10", "te da");
    msg(245, 0, 3, "4  TCP handshake to port 443: SYN, SYN-ACK, ACK", "", true);
    msg(290, 0, 3, "5  TLS handshake: check the certificate, agree keys", "", true);
    msg(335, 0, 3, "6  HTTPS request: GET /", "ac");
    msg(365, 3, 0, "200 OK and the page, encrypted", "ac da");
    out.push(g.text(340, 416, "Steps 3 to 6 all pass through the router, which swaps your private address for its public one (NAT).", "c s mu"));
    return g.svg(680, 426, out);
  },

  "osi": (g) => {
    const osi = [["7  Application", "a"], ["6  Presentation", "a"], ["5  Session", "a"], ["4  Transport", "t"], ["3  Network", "y"], ["2  Data link", "m"], ["1  Physical", "m"]];
    const ex = ["HTTP, DNS, SMTP, SSH", "encoding, compression, encryption", "opening and closing sessions", "TCP, UDP · ports · segments",
      "IP, ICMP · routers · packets", "Ethernet, Wi-Fi, ARP · switches · frames", "cables, radio, fibre · bits"];
    const out = [g.text(110, 24, "OSI model", "c b"), g.text(292, 24, "TCP/IP model", "c b"), g.text(376, 24, "Examples · devices · data unit", "b")];
    osi.forEach(([name, cls], i) => {
      const y = 36 + i * 42;
      out.push(g.box(10, y, 200, 38, `!${name}`, cls), g.text(376, y + 23.5, ex[i], "s"));
    });
    out.push(
      g.box(222, 36, 140, 122, ["!Application", "~layers 5 to 7"], "a"),
      g.box(222, 162, 140, 38, "!Transport", "t"),
      g.box(222, 204, 140, 38, "!Internet", "y"),
      g.box(222, 246, 140, 80, ["!Link", "~layers 1 and 2"], "m"),
    );
    return g.svg(680, 340, out);
  },

  "encap": (g) => {
    const rows = [
      ["Application: data", [["!Data", 480, 130, "a"]]],
      ["Transport: segment", [["^TCP · ports", 380, 100, "t"], ["!Data", 480, 130, "a"]]],
      ["Network: packet", [["^IP · addresses", 280, 100, "y"], ["^TCP", 380, 100, "t"], ["!Data", 480, 130, "a"]]],
      ["Data link: frame", [["^Ethernet · MACs", 170, 110, "m"], ["^IP", 280, 100, "y"], ["^TCP", 380, 100, "t"], ["!Data", 480, 130, "a"], ["^FCS", 610, 50, "m"]]],
    ];
    const out = [];
    rows.forEach(([label, cells], i) => {
      const y = 30 + i * 46;
      out.push(g.text(10, y + 22, label, "s b"));
      for (const [text, x, w, cls] of cells) out.push(g.box(x, y, w, 34, text, cls, 4));
    });
    out.push(
      g.text(340, 228, "Sending adds a header at each layer, and the frame also gets a checksum (FCS).", "c s mu"),
      g.text(340, 244, "The receiver strips them off in reverse order.", "c s mu"),
    );
    return g.svg(680, 256, out);
  },

  "handshake": (g) => {
    const c = 80;
    const s = 420;
    return g.svg(680, 266, [
      g.box(10, 10, 140, 44, ["!Client", "`192.168.1.50"], "d"),
      g.box(350, 10, 140, 44, ["!Server", "`203.0.113.10:443"], "m"),
      g.line(c, 54, c, 255, "lf"), g.line(s, 54, s, 255, "lf"),
      g.arrow(c + 2, 80, s - 3, 105, "te"), g.text(250, 83, "SYN  seq=100", "c s mo"),
      g.arrow(s - 2, 125, c + 3, 150), g.text(250, 128, "SYN-ACK  seq=300 ack=101", "c s mo"),
      g.arrow(c + 2, 170, s - 3, 195, "te"), g.text(250, 173, "ACK  ack=301", "c s mo"),
      g.box(c, 214, s - c, 30, "^Connection open: data flows both ways", "t"),
      g.text(450, 97, "\"Can we talk? I start at 100.\"", "s mu"),
      g.text(450, 142, "\"Got it. I start at 300.\"", "s mu"),
      g.text(450, 187, "\"Got 300.\" Connected.", "s mu"),
    ]);
  },

  "ip-bits": (g) => {
    const xs = [15, 175, 335, 495];
    const ip = [["192", "11000000"], ["168", "10101000"], ["10", "00001010"], ["37", "00100101"]];
    const mask = [["255", "11111111"], ["255", "11111111"], ["255", "11111111"], ["0", "00000000"]];
    const out = [g.text(15, 22, "IP address 192.168.10.37", "b"), g.text(15, 114, "Subnet mask /24 = 255.255.255.0", "b")];
    xs.forEach((x, i) => {
      out.push(g.box(x, 30, 150, 58, [`!${ip[i][0]}`, `\`${ip[i][1]}`], i < 3 ? "a" : "t"));
      out.push(g.box(x, 122, 150, 54, [`!${mask[i][0]}`, `\`${mask[i][1]}`], i < 3 ? "m" : ""));
    });
    out.push(
      g.path("M15 186 V194 H485 V186", "ac"),
      g.text(250, 214, "Network part: 24 bits, the same for every device on the subnet", "c s ac"),
      g.path("M495 186 V194 H645 V186", "te"),
      g.text(570, 214, "Host part: 8 bits", "c s te"),
      g.text(570, 230, "256 addresses, 254 usable", "c s mu"),
      g.text(330, 262, "network 192.168.10.0 · hosts .1 to .254 · broadcast 192.168.10.255", "c s mo"),
    );
    return g.svg(660, 276, out);
  },

  "dns": (g) => g.svg(680, 316, [
    g.box(15, 110, 130, 62, ["!Your laptop", "~asks one question"], "d"),
    g.box(245, 110, 160, 62, ["!Recursive resolver", "~ISP, company or 1.1.1.1", "~caches answers"], "a"),
    g.box(465, 15, 205, 62, ["!Root servers", "~2–3: \"ask the .com servers\""], "m"),
    g.box(465, 110, 205, 62, ["!.com TLD servers", "~4–5: \"ask example.com's servers\""], "m"),
    g.box(465, 205, 205, 62, ["!example.com's DNS", "~the authoritative server", "~6–7: \"shop is 203.0.113.10\""], "t"),
    g.arrow(147, 131, 243, 131), g.text(196, 124, "1  ask", "c s"),
    g.arrow(245, 153, 149, 153), g.text(196, 168, "8  answer", "c s"),
    g.path("M406 128 L464 52", "ar bo"),
    g.arrow(407, 141, 463, 141, "bo"),
    g.path("M406 154 L464 230", "ar bo"),
    g.text(340, 300, "Next time, the resolver answers from its cache until the record's TTL (time to live) runs out.", "c s mu"),
  ]),

  "vlans": (g) => g.svg(680, 340, [
    g.box(235, 12, 210, 56, ["!Router or firewall", "~default gateway for both VLANs"], "y"),
    g.text(455, 34, "rule: Staff to file server,", "s ac"),
    g.text(455, 50, "port 445 only", "s ac"),
    g.line(340, 68, 340, 130, "th"),
    g.text(350, 104, "trunk: 802.1Q tags", "s mo mu"),
    g.box(180, 130, 320, 50, ["!Switch", "~ports in VLAN 10 · ports in VLAN 20"], "d"),
    g.rect(15, 205, 310, 122, "n", 10),
    g.rect(355, 205, 310, 122, "n", 10),
    g.line(97, 240, 230, 180), g.line(242, 240, 290, 180), g.line(437, 240, 390, 180), g.line(582, 240, 450, 180),
    g.box(30, 240, 135, 62, ["!PC-A", "`10.0.10.21", "~gw 10.0.10.1"], "a"),
    g.box(175, 240, 135, 62, ["!PC-B", "`10.0.10.22", "~gw 10.0.10.1"], "a"),
    g.box(370, 240, 135, 62, ["!File server", "`10.0.20.10", "~gw 10.0.20.1"], "t"),
    g.box(515, 240, 135, 62, ["!Web app", "`10.0.20.11", "~gw 10.0.20.1"], "t"),
    g.text(27, 319, "VLAN 10 · Staff · 10.0.10.0/24", "s b ac"),
    g.text(367, 319, "VLAN 20 · Servers · 10.0.20.0/24", "s b te"),
  ]),

  "dmz": (g) => g.svg(680, 340, [
    g.box(10, 122, 120, 56, ["!Internet", "~untrusted"], "m"),
    g.box(195, 105, 120, 90, ["!Firewall", "~stateful", "~default deny"], "d"),
    g.arrow(130, 150, 194, 150),
    g.rect(390, 12, 280, 84, "n", 10), g.text(402, 44, "DMZ", "b"), g.text(402, 62, "public-facing", "s mu"),
    g.box(520, 28, 135, 52, ["!Web server", "`:443"], "t"),
    g.rect(390, 112, 280, 84, "n", 10), g.text(402, 144, "Staff LAN", "b"), g.text(402, 162, "web out only", "s mu"),
    g.box(520, 128, 135, 52, ["!Laptops", "`10.0.10.0/24"]),
    g.rect(390, 212, 280, 96, "n", 10), g.text(402, 244, "Server zone", "b"), g.text(402, 262, "no internet", "s mu"),
    g.box(520, 228, 135, 52, ["!Database", "`:5432"], "a"),
    g.arrow(315, 125, 389, 60, "te"), g.text(310, 92, "443 in: allowed", "e s te"),
    g.arrow(315, 150, 389, 150, "te"), g.text(352, 142, "replies", "c s te"),
    g.path("M655 54 H672 V254 H657", "ar te"),
    g.text(402, 299, "only the web server may connect, on 5432", "s te"),
    g.text(340, 332, "✕  Internet to the staff LAN or database: blocked, because no rule allows it (default deny)", "c s ac"),
  ]),
});
})();
