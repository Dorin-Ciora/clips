import {
  Component,
  AfterViewInit,
  ContentChildren,
  QueryList,
  ChangeDetectorRef,
} from '@angular/core';
import { TabComponent } from '../tab/tab.component';

@Component({
  selector: 'app-tabs-container',
  templateUrl: './tabs-container.component.html',
  styleUrls: ['./tabs-container.component.less'],
})
export class TabsContainerComponent implements AfterViewInit {
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent> =
    new QueryList();

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.checkActiveTabs();
      this.cdr.detectChanges();
    });
  }

  public selectTab(tab: TabComponent) {
    this.tabs.forEach((tab) => {
      tab.isActive = false;
    });

    tab.isActive = true;

    return false;
  }

  private checkActiveTabs() {
    const activeTabs = this.tabs.filter((tab) => tab.isActive);

    if (!activeTabs || activeTabs.length === 0) {
      this.selectTab(this.tabs.first);
    }
  }
}
