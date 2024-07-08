import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ImageSizeService } from 'src/app/services/image-size.service';

@Component({
  selector: 'app-image-loader',
  templateUrl: './image-loader.component.html',
  styleUrls: ['./image-loader.component.less'],
})
export class ImageLoaderComponent implements OnInit {
  @Input() imageUrl: string = '';
  @Input() priority = false;
  isLoading = true;
  hasError = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private imageSizeService: ImageSizeService,
  ) {}

  ngOnInit(): void {
    console.log('asdasd');
    // Initialize the component
    this.setImageDimensions();
  }

  setImageDimensions(): void {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.isLoading = false;
      this.cdr.detectChanges();
    };
    img.src = this.imageUrl;
  }

  onLoad(): void {
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  onError(): void {
    this.isLoading = false;
    this.hasError = true;
  }

  private shouldAddPriority(width: number, height: number): boolean {
    // Define your condition to add the priority attribute
    return width > 1000 || height > 1000;
  }
}
