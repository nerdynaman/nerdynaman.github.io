---
title: Raft
date: 2023-10-26
external_link: https://github.com/scikit-learn/scikit-learn
tags:
  - Hugo
  - Wowchemy
  - Markdown
---

This project is a implementation of the Raft consensus algorithm in Python. Raft is designed to provide a robust, fault-tolerant mechanism for managing replicated logs across multiple servers. It ensures that all nodes agree on the values stored in the log, even in the presence of failures.

We have implemented the following features in our Raft implementation:
- Leader election
- Log replication
- Fault tolerance
- State machine safety via log matching