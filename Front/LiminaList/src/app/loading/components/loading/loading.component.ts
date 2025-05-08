import { Component } from '@angular/core';
import { LoadingService } from '../../../services/loading.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-loading',
  standalone: false,
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent {
  constructor(public loadingService: LoadingService) {}
  //isLoading$: Observable<boolean> = this.loadingService.isLoading$;
}