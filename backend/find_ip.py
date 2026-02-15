#!/usr/bin/env python3
"""
Network utility to find the correct IP address for mobile app connection
"""
import socket
import subprocess
import platform
import re

def get_local_ip():
    """Get the local IP address"""
    try:
        # Connect to a remote address to get local IP
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except:
        return None

def get_all_network_interfaces():
    """Get all network interfaces and their IPs"""
    interfaces = []
    system = platform.system().lower()
    
    try:
        if system == "windows":
            result = subprocess.run(['ipconfig'], capture_output=True, text=True)
            lines = result.stdout.split('\n')
            
            current_adapter = ""
            for line in lines:
                line = line.strip()
                if "adapter" in line.lower() and ":" in line:
                    current_adapter = line
                elif "IPv4 Address" in line:
                    ip_match = re.search(r'(\d+\.\d+\.\d+\.\d+)', line)
                    if ip_match:
                        ip = ip_match.group(1)
                        if not ip.startswith('127.'):
                            interfaces.append((current_adapter, ip))
        
        elif system in ["linux", "darwin"]:  # Linux or macOS
            result = subprocess.run(['ifconfig'], capture_output=True, text=True)
            lines = result.stdout.split('\n')
            
            current_interface = ""
            for line in lines:
                if line and not line.startswith(' ') and not line.startswith('\t'):
                    current_interface = line.split(':')[0]
                elif 'inet ' in line and '127.0.0.1' not in line:
                    ip_match = re.search(r'inet (\d+\.\d+\.\d+\.\d+)', line)
                    if ip_match:
                        ip = ip_match.group(1)
                        interfaces.append((current_interface, ip))
                        
    except Exception as e:
        print(f"❌ Error getting network interfaces: {e}")
    
    return interfaces

def main():
    print("🔍 Network Configuration Helper")
    print("=" * 50)
    
    # Get primary local IP
    local_ip = get_local_ip()
    if local_ip:
        print(f"🎯 Recommended IP for mobile connection: {local_ip}")
        print(f"📱 Update your mobile app API.js with: const HOST_IP = '{local_ip}';")
    else:
        print("❌ Could not detect primary IP address")
    
    print("\n📡 All available network interfaces:")
    print("-" * 30)
    
    interfaces = get_all_network_interfaces()
    if interfaces:
        for adapter, ip in interfaces:
            emoji = "🎯" if ip == local_ip else "📍"
            print(f"{emoji} {ip:<15} ({adapter})")
    else:
        print("❌ No network interfaces found")
    
    print("\n🔧 Next steps:")
    print("1. Copy one of the above IP addresses")
    print("2. Update mobile/src/services/api.js:")
    print("   const HOST_IP = 'YOUR_IP_HERE';") 
    print("3. Start Django server with: python manage.py runserver 0.0.0.0:8000")
    print("4. Test connection from mobile app")
    
    print(f"\n🌐 Django Admin will be available at:")
    if local_ip:
        print(f"   http://{local_ip}:8000/admin/")
    print("   http://localhost:8000/admin/")

if __name__ == "__main__":
    main()