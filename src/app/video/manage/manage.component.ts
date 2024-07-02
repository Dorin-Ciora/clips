import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, every } from 'rxjs';
import IClip from 'src/app/model/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.less'],
})
export class ManageComponent implements OnInit {
  public videoOrder: string = 'asc';
  clips: IClip[] = [];
  activeClip: IClip | null = null;
  sort$: BehaviorSubject<string>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    private modalService: ModalService
  ) {
    this.sort$ = new BehaviorSubject(this.videoOrder);
  }

  ngOnInit(): void {
    this.getQueryParams();
    this.getUserClips();
  }

  public sort(event: Event) {
    const { value } = event.target as HTMLSelectElement;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: value,
      },
    });
  }

  public onEditClip($event: Event, clip: IClip): void {
    $event.preventDefault();
    this.activeClip = clip;
    this.modalService.toggleModal('editClip');
  }

  public update($event: IClip) {
    this.clips.forEach((clip, index) => {
      if (clip.docID === $event.docID) {
        this.clips[index].title = $event.title;
        setTimeout(() => this.modalService.toggleModal('editClip'), 2000);
      }
    });
  }

  public onDeleteClip($event: Event, clipToBeDeleted: IClip) {
    $event.preventDefault();

    this.clipService.deleteClip(clipToBeDeleted);

    this.clips.forEach((clip, index) => {
      if (clip.docID === clipToBeDeleted.docID) {
        this.clips.splice(index, 1);
      }
    });
  }

  private getQueryParams(): void {
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      const sort = params.get('sort');
      this.videoOrder = sort === 'desc' ? sort : 'asc';
      this.sort$.next(this.videoOrder);
    });
  }

  private getUserClips(): void {
    this.clipService.getUserClips(this.sort$).subscribe((docs) => {
      this.clips = [];
      docs.forEach((document) => {
        this.clips.push({
          docID: document.id,
          ...document.data(),
        });
      });
    });
  }
}
