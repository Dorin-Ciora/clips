import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      let sort = params.get('sort');
      this.videoOrder = sort === 'desc' ? sort : 'asc';
    });
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

    this.modalService.toggleModal('editClip');
  }

  private getUserClips(): void {
    this.clipService.getUserClips().subscribe(docs => {
      this.clips = [];
      docs.forEach(document => {
        this.clips.push({
          docID: document.id,
          ...document.data()
        })
      })
    });
  }
}
