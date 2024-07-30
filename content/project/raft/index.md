---
title: Raft
date: 2024-02-10
# external_link: https://github.com/nerdynaman/RaftConsesusAlgo/commits/main/
tags:
  - Consensus Algorithm
  - Raft
  - Python
  - Grpc
  - Distributed Systems
  - Fault Tolerance
  - Leader Election
  - Log Replication
  - State Machine Safety
  - Research Paper Implementation
---

This project is a implementation of the Raft consensus algorithm in Python, [Research paper](https://raft.github.io/raft.pdf). Raft is designed to provide a robust, fault-tolerant mechanism for managing replicated logs across multiple servers. It ensures that all nodes agree on the values stored in the log, even in the presence of failures.

We have implemented the following features in our Raft implementation:
- Leader election
- Log replication
- Fault tolerance
- State machine safety via log matching

[GitHub](https://github.com/nerdynaman/RaftConsesusAlgo)