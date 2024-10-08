import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';
import IClip from '../model/clip.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  BehaviorSubject,
  combineLatest,
  lastValueFrom,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { OrderByDirection } from '@angular/fire/firestore';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ClipService implements Resolve<IClip | null> {
  public clipsCollection: AngularFirestoreCollection<IClip>;
  public pageClips: IClip[] = [];
  public pendingRequest = false;

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router,
  ) {
    this.clipsCollection = this.db.collection('clips');
  }

  public createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(data);
  }

  getUserClips(videoSort$: BehaviorSubject<string>) {
    return combineLatest([this.auth.user, videoSort$]).pipe(
      switchMap((values) => {
        const [user, sort] = values;

        if (!user) {
          return of([]);
        }

        const query = this.clipsCollection.ref
          .where('uid', '==', user.uid)
          .orderBy('timestamp', sort as OrderByDirection);

        return query.get();
      }),
      map((snapshot) => (snapshot as QuerySnapshot<IClip>).docs),
    );
  }

  updateClip(id: string, title: string): Promise<void> {
    return this.clipsCollection.doc(id).update({
      title,
    });
  }

  async deleteClip(clip: IClip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`);
    const screenshotRef = this.storage.ref(
      `screenshots/${clip.screenshotFileName}`,
    );

    await clipRef.delete();
    await screenshotRef.delete();

    await this.clipsCollection.doc(clip.docID).delete();
  }

  async getClips() {
    this.pendingRequest = true;
    let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(6);
    const { length } = this.pageClips;

    if (length) {
      const lastDocID = this.pageClips[length - 1].docID;
      const lastDoc = await lastValueFrom(
        this.clipsCollection.doc(lastDocID).get(),
      );

      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    snapshot.forEach((doc) => {
      this.pageClips.push({
        docID: doc.id,
        ...doc.data(),
      });
    });
    this.pendingRequest = false;
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<IClip | null> | Promise<IClip | null> | (IClip | null) {
    return this.clipsCollection
      .doc(route.params['id'])
      .get()
      .pipe(
        map((snapshot) => {
          const data = snapshot.data();

          if (!data) {
            this.router.navigate(['/']);
            return null;
          }

          return data;
        }),
      );
  }
}
