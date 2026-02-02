// src/app/services/sound.service.ts
import { Injectable } from '@angular/core';

@Injectable({

  providedIn: 'root'

})

export class SoundService {

  private static _instance: SoundService;



  private sounds: { [key: string]: HTMLAudioElement } = {};

  private isMuted: boolean = false;



  constructor() {

    SoundService._instance = this;

  }



  public static instance(): SoundService {

    return SoundService._instance;

  }



  async loadSounds(soundFiles: { key: string, path: string }[]): Promise<void> {
    const promises = soundFiles.map(soundFile => this.loadSound(soundFile.key, soundFile.path));
    await Promise.all(promises);
  }

  private loadSound(key: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = path;
      audio.load();
      audio.oncanplaythrough = () => {
        this.sounds[key] = audio;
        resolve();
      };
      audio.onerror = (e) => {
        console.error(`Failed to load sound: ${path}`, e);
        reject(new Error(`Failed to load sound: ${path}`));
      };
    });
  }

  playSound(key: string, loop: boolean = false): void {
    if (this.isMuted) {
      return;
    }
    const sound = this.sounds[key];
    if (sound) {
      sound.loop = loop;
      // Play from the start
      sound.currentTime = 0;
      sound.play().catch(e => console.error(`Could not play sound: ${key}`, e));
    } else {
      console.warn(`Sound not found: ${key}`);
    }
  }

  stopSound(key: string): void {
    const sound = this.sounds[key];
    if (sound) {
      sound.pause();
      sound.currentTime = 0; // Reset sound to the beginning
    }
  }

  pauseSound(key: string): void {
    const sound = this.sounds[key];
    if (sound && !sound.paused) {
      sound.pause();
    }
  }

  resumeSound(key: string): void {
    if (this.isMuted) {
      return;
    }
    const sound = this.sounds[key];
    if (sound && sound.paused) {
      sound.play().catch(e => console.error(`Could not resume sound: ${key}`, e));
    }
  }

  stopAllSounds(): void {
    for (const key in this.sounds) {
      if (this.sounds.hasOwnProperty(key)) {
        this.stopSound(key);
      }
    }
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      for (const key in this.sounds) {
        if (this.sounds.hasOwnProperty(key)) {
            this.stopSound(key);
        }
      }
    }
  }
  
  get IsMuted(): boolean {
    return this.isMuted;
  }

  setGlobalVolume(volume: number): void {
    if (volume < 0) volume = 0;
    if (volume > 1) volume = 1;

    for (const key in this.sounds) {
      if (this.sounds.hasOwnProperty(key)) {
        this.sounds[key].volume = volume;
      }
    }
  }

  setSoundVolume(key: string, volume: number): void {
    if (volume < 0) volume = 0;
    if (volume > 1) volume = 1;

    const sound = this.sounds[key];
    if (sound) {
      sound.volume = volume;
    } else {
      console.warn(`Sound not found: ${key}`);
    }
  }
}
