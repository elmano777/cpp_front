import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  imports: [FormsModule],
  templateUrl: './main.component.html',
})
export class MainComponent implements OnInit {
  userName: string = "";
  today = new Date();
  dateStr = this.today.toISOString().slice(0, 10);
  timeStr : string = "";
  datetime = `${this.dateStr} ${this.timeStr}`;
  reservas: any[] = []
  deleteDate: string = '';
  deleteTime: string = '';
  deleteClient: string = '';

  constructor(private router: Router, private httpclient: HttpClient) {}

  ngOnInit() {
    this.setName();
    this.loadReservations();
  }

  createReservation() {
    if (!this.timeStr) {
      alert('Por favor ingresa una hora');
      return;
    }

    const reservationData = {
      datetime: this.datetime,
      client: this.userName
    };

    this.httpclient.post('http://localhost:8080/reservations', reservationData)
      .subscribe({
        next: (response) => {
          console.log('Reserva creada:', response);
          this.timeStr = '';
          this.loadReservations();
        },
        error: (error) => {
          console.error('Error al crear reserva:', error);
        }
      });
  }

  loadReservations() {
    this.httpclient.get<any>('/reservations.json').subscribe({
      next: (data) => {
        this.reservas = (data.reservations || []).map((reserva: string) => {
          const [datetime, client] = reserva.split('_');
          return { datetime, client };
        });
      },
      error: (error) => {
        console.error('Error cargando reservas:', error);
      }
    });
  }

  deleteReservation() {
    if (!this.deleteDate || !this.deleteTime || !this.deleteClient) {
      alert('Por favor completa todos los campos para eliminar');
      return;
    }

    const key = `${this.deleteDate} ${this.deleteTime}_${this.deleteClient}`;
    console.log('Clave a eliminar:', key);

    const encodedKey = encodeURIComponent(key);

    this.httpclient.delete(`http://localhost:8080/reservations/${encodedKey}`)
      .subscribe({
        next: (response) => {
          console.log('Reserva eliminada:', response);
          this.deleteDate = '';
          this.deleteTime = '';
          this.deleteClient = '';
          this.loadReservations();
        },
        error: (error) => {
          console.error('Error al eliminar reserva:', error);
          alert('Error al eliminar reserva. Verifica que los datos sean correctos.');
        }
      });
  }

  setName() {
    const storedName = localStorage.getItem("userName");
    this.userName = storedName || "Usuario";
  }

  logOut(){
    localStorage.clear();
    this.router.navigate(["/"])
  }

  toFront(){
    this.router.navigate(["/reservas"])
  }

  toBack(){
    this.router.navigate(["/backend"])
  }
}
