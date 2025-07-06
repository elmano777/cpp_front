import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TreeNode {
  key: string;
  priority: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

interface NodePosition {
  x: number;
  y: number;
  node: TreeNode;
}

@Component({
  selector: 'app-backend',
  imports: [CommonModule, FormsModule],
  templateUrl: './backend.component.html',
})
export class BackendComponent implements OnInit {
  userName: string = "";

  treeStructure: TreeNode | null = null;
  nodePositions: NodePosition[] = [];
  lines: { x1: number, y1: number, x2: number, y2: number }[] = [];
  svgWidth = 1200;
  svgHeight = 800;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.setName();
    this.loadTreeStructure();
  }

  setName() {
    const storedName = localStorage.getItem("userName");
    this.userName = storedName || "Usuario";
  }

  logOut() {
    localStorage.clear();
    this.router.navigate(["/"]);
  }

  toFront() {
    this.router.navigate(["/reservas"]);
  }

  toBack() {
    this.router.navigate(["/backend"]);
  }

  loadTreeStructure() {
    this.http.get<any>('/arbol.json')
      .subscribe({
        next: (response) => {
          console.log('Estructura del árbol:', response);
          this.treeStructure = response.tree;
          this.calculatePositions();
        },
        error: (error) => {
          console.error('Error al cargar estructura del árbol:', error);
        }
      });
  }

  private calculatePositions() {
    this.nodePositions = [];
    this.lines = [];

    if (!this.treeStructure) return;

    const nodeWidth = 120;
    const levelHeight = 80;

    this.calculateNodePositions(this.treeStructure, this.svgWidth / 2, 50, nodeWidth, levelHeight);
    this.calculateLines();
  }

  private calculateNodePositions(node: TreeNode, x: number, y: number, width: number, height: number) {
    if (!node) return;

    this.nodePositions.push({ x, y, node });

    const childWidth = width / 2;

    if (node.left) {
      this.calculateNodePositions(node.left, x - width/2, y + height, childWidth, height);
    }

    if (node.right) {
      this.calculateNodePositions(node.right, x + width/2, y + height, childWidth, height);
    }
  }

  private calculateLines() {
    this.lines = [];

    for (const pos of this.nodePositions) {
      if (pos.node.left) {
        const leftChild = this.nodePositions.find(p => p.node === pos.node.left);
        if (leftChild) {
          this.lines.push({
            x1: pos.x,
            y1: pos.y,
            x2: leftChild.x,
            y2: leftChild.y
          });
        }
      }

      if (pos.node.right) {
        const rightChild = this.nodePositions.find(p => p.node === pos.node.right);
        if (rightChild) {
          this.lines.push({
            x1: pos.x,
            y1: pos.y,
            x2: rightChild.x,
            y2: rightChild.y
          });
        }
      }
    }
  }

  getShortKey(key: string): string {
    const parts = key.split('_');
    if (parts.length >= 2) {
      const timePart = parts[0].split(' ')[1] || parts[0];
      const clientPart = parts[1].substring(0, 8) + '...';
      return `${timePart}\n${clientPart}`;
    }
    return key.substring(0, 10) + '...';
  }
}
