# 📱 Mobile Connection Troubleshooting

## 🔍 Quick Tests (Do these on your PHONE):

### Test 1: Can your phone reach the server?
Open your phone's browser and go to:
```
http://192.168.1.4:8000/api/auth/login/
```

**Expected Result:**
- You should see `{"detail":"Method \"GET\" not allowed."}` 
- This means server is reachable! ✅

**If you get:**
- "Can't reach this page" / "Connection refused" → Firewall blocking ❌
- "Timeout" → Wrong IP address or different WiFi ❌

### Test 2: Ping Test
Open terminal app on phone (or use JuiceSSH) and run:
```
ping 192.168.1.4
```
If it works, network is fine. If not, check WiFi.

---

## 🔥 Fix Windows Firewall (Admin Required)

### Method 1: Add Firewall Rule via GUI
1. Press **Win + R**, type: `wf.msc`, press Enter
2. Click **Inbound Rules** → **New Rule...**
3. **Port** → Next
4. **TCP**, port **8000** → Next
5. **Allow the connection** → Next
6. Check **all boxes** (Domain, Private, Public) → Next
7. Name: `Django Dev 8000` → Finish

### Method 2: PowerShell (Run as Admin)
Right-click PowerShell → Run as Administrator:
```powershell
New-NetFirewallRule -DisplayName "Django Dev Server" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

### Method 3: Quick Test - Temporary Disable
**⚠️ ONLY FOR TESTING - Re-enable after!**
1. Win + I → Windows Security
2. Firewall & network protection
3. Click your active network (Private network)
4. Turn OFF Microsoft Defender Firewall
5. Test app on phone
6. **TURN FIREWALL BACK ON!**

---

## ✅ Verify These:

- [ ] Computer IP: `192.168.1.4` (check with `ipconfig` in terminal)
- [ ] Phone and computer on SAME WiFi network
- [ ] Django running: `http://0.0.0.0:8000`
- [ ] Port 8000 open in firewall
- [ ] Phone browser can access: `http://192.168.1.4:8000/api/auth/login/`

---

## 🎯 What to do NOW:

1. **Test from phone browser first**: `http://192.168.1.4:8000/api/auth/login/`
2. If can't reach → Fix firewall (Method 1 or 2 above)
3. If can reach → Reload Expo app (shake phone → Reload)
4. Try login again

Report back what you see in phone browser!
