import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PingService } from './services/ping.service';
import { Store } from '@ngrx/store';
import { S3Service } from './services/s3.service';
import { selectCoins } from './state/coins.selectors';
import * as CoinsActions from './state/coins.actions';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, RouterOutlet]
})
export class App implements OnInit {
  private pingService = inject(PingService);
  private store = inject(Store);
  private s3 = inject(S3Service);

  ngOnInit() {
    // when coins load, fetch folder filenames for the first coin and store in state
    this.s3.getCoinFolderFilenames().subscribe(images => {
      this.store.dispatch(CoinsActions.setCoinImages({ images }));
    });
  }
}
