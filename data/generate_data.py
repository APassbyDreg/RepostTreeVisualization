import pickle
import random
import math
import json
import numpy as np


class Node:
    num_total = 0
    def __init__(self, p, t, rdn=None) -> None:
        # identifier
        self.idx = Node.num_total
        Node.num_total += 1
        # infomation
        if p is not None:
            self.parent = p.idx
        else:
            self.parent = None
        self.timestamp = t
        # random part
        self.end = False
        if rdn is None:
            rdn = random.random()
        self.end_prob = rdn ** 2
        self.num_fans = math.ceil(((1 - rdn) ** 8) * 10000)
    def __str__(self):
        return f"< Node[{self.idx}] end='{self.end}' end-prob='{self.end_prob}' fans='{self.num_fans}' >"
    def to_dict(self):
        return {
            "idx": self.idx,
            "parent": self.parent,
            "timestamp": self.timestamp,
            "fans": self.num_fans,
        }


root = Node(None, 0, 0.2)
nodes = [root]
print("start from root:", root)

BASE_REPOST_RATE = 0.0001
TIMESTAMPS = 200
for t in range(TIMESTAMPS):
    rate = BASE_REPOST_RATE * (TIMESTAMPS - t) / TIMESTAMPS
    new_nodes = []
    for n in nodes:
        if not n.end:
            if (random.random() ** (1 - t / TIMESTAMPS)) > 1 - n.end_prob:
                n.end = True
            num_new_repo = np.sum(np.random.choice([1, 0], size=n.num_fans, p=[rate, 1-rate]))
            for f in range(num_new_repo):
                new_nodes.append(Node(n, t))
    nodes.extend(new_nodes)
    print(f"time {t:05d}: {len(nodes)} reposts in total")
    if len(nodes) > 5000:
        break


f = open("./data.json", "w")
json.dump([n.to_dict() for n in nodes], f)