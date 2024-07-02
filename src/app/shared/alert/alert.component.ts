import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.less'],
})
export class AlertComponent implements OnInit {
  @Input() color: string = 'blue';

  constructor() {}

  ngOnInit(): void {}

  public get backgroundColor() {
    return `bg-${this.color}-400`;
  }
}
