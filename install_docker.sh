echo --Docker Installer----------
echo |                          |
echo | Make sure you are root   |
echo | user.                    |
echo |                          |
echo | Install will start in    |
echo | 5 second.                |
echo |                          |
echo ----------------------------

sleep 5s

# Add Docker's official GPG key:
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
apt-get update
apt-get install ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
echo --Docker Installer----------------------------------
echo |                                                  |
echo | Docker install finished!                         |
echo | Try to run "sudo docker run hello-world" command!|
echo |                                                  |
echo ----------------------------------------------------
