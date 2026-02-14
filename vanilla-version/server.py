#!/usr/bin/env python3
"""
Simple HTTP server for testing the 3D AR Viewer PWA
Run with: python server.py
"""

import http.server
import socketserver
import os
import socket

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add headers for PWA and CORS
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        super().end_headers()

    def guess_type(self, path):
        # Add proper MIME types
        mimetype = super().guess_type(path)
        if path.endswith('.glb'):
            return 'model/gltf-binary'
        elif path.endswith('.gltf'):
            return 'model/gltf+json'
        elif path.endswith('.js'):
            return 'application/javascript'
        return mimetype

def get_ip_address():
    """Get the local IP address"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        ip_address = get_ip_address()
        print("=" * 60)
        print("🚀 3D AR Viewer Server Started!")
        print("=" * 60)
        print(f"\n📱 Local access:")
        print(f"   http://localhost:{PORT}")
        print(f"\n🌐 Network access (for mobile testing):")
        print(f"   http://{ip_address}:{PORT}")
        print(f"\n⚠️  Note: AR features require HTTPS in production")
        print(f"   For local testing, AR may work on localhost only")
        print("\n🛑 Press Ctrl+C to stop the server\n")
        print("=" * 60)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped.")

