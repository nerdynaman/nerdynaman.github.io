---
title: IRC Chat Server
date: 2024-01-01
# external_link: https://github.com/nerdynaman/IRCChatServer
tags:
    - Network Security
    - Networking
    - Chat
    - IRC
    - Authentication
    - Multithreading
    - Socket Programming
---

Implemented a authentication feature for a KDC based multi-threaded IRC chat server using needham schroeder protocol. There is a central Key Distribution Server which acts as a trusted party which clients can use to authenticate themselves. The server is implemented in C using socket programming.

Further feautures added to needham schroeder protocol are:
- Prevention of replay attacks
- Bidirectional authentication between client and server
- Encryption of messages using AES along with HMAC for integrity check
- Random IV generation for each message



[Github](https://github.com/nerdynaman/IRCChatServer)