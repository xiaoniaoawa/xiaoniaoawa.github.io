#!/bin/bash

set -e

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root: sudo $0"
  exit 1
fi

apt-get update
apt-get install -y python3-picamera python3-rpi.gpio ntfs-3g

if command -v raspi-config >/dev/null 2>&1; then
  raspi-config nonint do_camera 0 || true
fi

wget -q -O /usr/bin/kigcam.py \
  https://raw.githubusercontent.com/xiaoniaoawa/Kigurumi-Camera/main/kigcam.py
chmod +x /usr/bin/kigcam.py

wget -q -O /etc/systemd/system/kigcamera.service \
  https://raw.githubusercontent.com/xiaoniaoawa/Kigurumi-Camera/main/kigcamera.service

systemctl daemon-reload
systemctl enable kigcamera.service
systemctl start kigcamera.service

echo "Installation complete. Please insert a USB drive labeled kigcam and reboot the Raspberry Pi."
