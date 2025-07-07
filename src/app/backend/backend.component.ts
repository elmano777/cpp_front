import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  userName: string = '';
  treeStructure: TreeNode | null = null;
  nodePositions: NodePosition[] = [];
  lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  svgWidth = 1200;
  svgHeight = 800;
  isLoading = false;
  errorMessage = '';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.setName();
    this.loadTreeStructure();
  }

  setName() {
    const storedName = localStorage.getItem('userName');
    this.userName = storedName || 'Usuario';
  }

  logOut() {
    localStorage.clear();
    this.router.navigate(['/']);
  }

  toFront() {
    this.router.navigate(['/reservas']);
  }

  toBack() {
    this.router.navigate(['/backend']);
  }

  /*
  loadTreeStructure() {
    this.isLoading = true;
    this.errorMessage = '';

    // Cargar desde el archivo local arbol.json
    this.http.get('/arbol.json')
      .subscribe({
        next: (response: any) => {
          console.log('Datos cargados desde arbol.json:', response);

          if (response && response.tree) {
            this.treeStructure = response.tree;
            this.calculatePositions();
            console.log('Árbol de prueba cargado exitosamente');
          } else {
            this.errorMessage = 'El archivo arbol.json no contiene la estructura del árbol';
          }

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar arbol.json:', error);
          this.errorMessage = 'Error al cargar el archivo de prueba arbol.json';
          this.isLoading = false;
        }
      });
  }
  */

  loadTreeStructure() {
    this.isLoading = true;
    this.errorMessage = '';

    // Configurar headers para evitar problemas de CORS
    const httpOptions = {
      responseType: 'text' as const,
      headers: new HttpHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    };

    // Cambiar a puerto 8081 para evitar conflictos
    const baseUrl = 'http://127.0.0.1:8081';
    //const baseUrl = '/arbol.json';
    //const baseUrl = 'http://127.0.0.1:8081';
    //const baseUrl = 'http://127.0.0.1:8081';
    console.log('Haciendo petición a: ' + baseUrl + '/reserva/tree');

    this.http.get(baseUrl + '/reserva/tree', httpOptions).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor (texto):', response);
        console.log('Tipo de respuesta:', typeof response);
        console.log('Longitud de respuesta:', response.length);

        // Verificar si la respuesta parece ser HTML
        if (
          typeof response === 'string' &&
          response.trim().startsWith('<!doctype html>')
        ) {
          this.errorMessage =
            'El servidor está devolviendo HTML en lugar de JSON. Posible problema de CORS o configuración del servidor.';
          console.error(
            'Respuesta HTML detectada:',
            response.substring(0, 200) + '...'
          );
          this.isLoading = false;
          return;
        }

        try {
          // Intentar parsear manualmente el JSON
          const jsonResponse = JSON.parse(response);
          console.log('Respuesta parseada:', jsonResponse);

          // Verificar si la respuesta es válida
          if (jsonResponse && typeof jsonResponse === 'object') {
            if (jsonResponse.tree !== undefined) {
              this.treeStructure = jsonResponse.tree;
              this.calculatePositions();
              console.log('Árbol cargado exitosamente');
            } else {
              this.errorMessage =
                'La respuesta no contiene la estructura del árbol';
            }
          } else {
            this.errorMessage = 'Respuesta del servidor no es válida';
          }
        } catch (parseError) {
          console.error('Error al parsear JSON:', parseError);
          console.error('Respuesta que causó el error:', response);
          this.errorMessage = 'Error al procesar la respuesta del servidor';
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar estructura del árbol:', error);
        console.error('Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message,
          error: error.error,
        });

        this.errorMessage = `Error del servidor: ${error.status} - ${error.statusText}`;
        this.isLoading = false;

        // Si el servidor no está ejecutándose, mostrar mensaje específico
        if (error.status === 0) {
          this.errorMessage =
            'No se puede conectar al servidor. Verifica que el servidor C++ esté ejecutándose en puerto 8080.';
        }
      },
    });
  }

  // Método para recargar manualmente
  reloadTree() {
    this.loadTreeStructure();
  }

  private calculatePositions() {
    this.nodePositions = [];
    this.lines = [];
    if (!this.treeStructure) return;

    const nodeWidth = 500;
    const levelHeight = 100;
    this.calculateNodePositions(
      this.treeStructure,
      this.svgWidth / 2,
      50,
      nodeWidth,
      levelHeight
    );
    this.calculateLines();
  }

  private calculateNodePositions(
    node: TreeNode,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    if (!node) return;

    this.nodePositions.push({ x, y, node });

    const childWidth = width / 2;
    if (node.left) {
      this.calculateNodePositions(
        node.left,
        x - width / 2,
        y + height,
        childWidth,
        height
      );
    }
    if (node.right) {
      this.calculateNodePositions(
        node.right,
        x + width / 2,
        y + height,
        childWidth,
        height
      );
    }
  }

  private calculateLines() {
    this.lines = [];
    for (const pos of this.nodePositions) {
      if (pos.node.left) {
        const leftChild = this.nodePositions.find(
          (p) => p.node === pos.node.left
        );
        if (leftChild) {
          this.lines.push({
            x1: pos.x,
            y1: pos.y,
            x2: leftChild.x,
            y2: leftChild.y,
          });
        }
      }
      if (pos.node.right) {
        const rightChild = this.nodePositions.find(
          (p) => p.node === pos.node.right
        );
        if (rightChild) {
          this.lines.push({
            x1: pos.x,
            y1: pos.y,
            x2: rightChild.x,
            y2: rightChild.y,
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
