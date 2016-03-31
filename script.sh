#!/bin/bash
echo "user data script" > /home/ubuntu/test.txt
apt-get -y install git
git --version > /home/ubuntu/git.txt
