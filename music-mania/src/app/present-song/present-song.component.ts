import { N, O, P, Q, SPACE, W } from '@angular/cdk/keycodes';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { getCurrentTimeInFormat } from '../controller/time-controller';
import { environment } from '../../environments/environment';
import { Settings } from '../model/settings.model';
import { Track } from '../model/track.model';
import { TrackStore } from '../services/track-store';

@Component({
  selector: 'app-present-song',
  templateUrl: './present-song.component.html',
  styleUrls: ['./present-song.component.scss']
})
export class PresentSongComponent implements OnInit, OnDestroy {
  private readonly destroy = new Subject<void>();
  settings!: Settings;
  currentSong!: Track;
  constructor(private trackStore: TrackStore, readonly router: Router) { }
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.keyCode === P) {
      this.prevAudio(20);
    }
    else if (event.keyCode === Q) {
      this.prevAudio(5);
    }
    else if (event.keyCode === N) {
      this.nextAudio();
    }
    else
      if (event.keyCode === SPACE) {
        this.playSong();
      }
      else
        if (event.keyCode === W) {
          this.closeBar();
        }
        else
          if (event.keyCode === O) {
            this.openPlayer();
          }
    event.preventDefault();
  }
  
  ngOnInit(): void {
    this.trackStore.currentSong.pipe(takeUntil(this.destroy)).subscribe((data) => {
      this.currentSong = data;
    });
    this.trackStore.settings.pipe(takeUntil(this.destroy)).subscribe((data) => {
      this.settings = data;
    });
  }

  getThumbNailSrc(id?: string) {
    return this.settings?.currentPlaylist.length && id ? `${environment.streamAddress}images/thumbnail/${id}.png` : '/assets/music-thumbnail.png';
  }

  playSong() {
    let myAudio: HTMLMediaElement | null = this.getPlayer();
    if (this.settings.audioStatus) {
      myAudio.pause();
      this.settings.audioStatus = false;
    }
    else {
      myAudio.play();
      this.settings.audioStatus = true;
    }
    this.getCurrentTime();
  }

  getCurrentTime() {
    getCurrentTimeInFormat(this, false);
    this.trackStore.settings.next(this.settings);
  }

  getPlayer() {
    return <HTMLVideoElement>document.getElementsByTagName('audio')[0];
  }

  setAudioPlayer() {
    this.trackStore.currentSong.next(this.settings.currentPlaylist[this.settings.currentTrackIndex]);
    let audioSource = `${environment.streamAddress}songs/${this.currentSong._id}`;
    let myAudio: HTMLMediaElement | null = this.getPlayer();
    myAudio.src = audioSource;
    myAudio.onended = () => { this.nextAudio(); }
  }

  openPlayer() {
    this.getCurrentTime(); this.router.navigate(['/track']);
  }

  prevAudio(data: number) {
    this.settings.currentDuration = 0;
    if (data > 10 || data == 0) {
      this.settings.audioStatus = !this.settings.audioStatus;
      if (this.settings.loop) this.settings.currentTrackIndex;
      else {
        if (this.settings.currentTrackIndex === 0) this.settings.currentTrackIndex = this.settings.currentPlaylist.length - 1;
        else --this.settings.currentTrackIndex;
      }
    } else {
      this.settings.audioStatus = !this.settings.audioStatus
    }
    this.setAudioPlayer();
    this.playSong();
  }


  closeBar() {
    this.trackStore.settings.next({
      isSearch: false,
      lock: false,
      sort: 'title',
      audioStatus: false,
      duration: 1,
      currentDuration: 0,
      shuffle: true,
      fullScreen: false,
      currentTrackIndex: 0,
      muted: false,
      currentPlaylist: [],
      volume: 1,
      loop: false
    });
    this.settings.currentDuration = 0;
    this.trackStore.currentSong.next({
      backgroundColor: '',
      _id: '',
      textColor: '',
      title: '',
      artist: [],
      album: '',
      picture: ''
    });
    this.settings.audioStatus = !this.settings.audioStatus;
    this.playSong();
  }

  nextAudio() {
    this.settings.currentDuration = 0;
    this.settings.audioStatus = !this.settings.audioStatus;
    if (this.settings.loop) this.settings.currentTrackIndex;
    else {
      if (this.settings.currentTrackIndex < this.settings.currentPlaylist.length - 1) ++this.settings.currentTrackIndex;
      else this.settings.currentTrackIndex = 0;
    }
    this.setAudioPlayer();
    this.playSong();
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
