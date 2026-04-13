import { Component } from '@angular/core';

@Component({
  selector: 'app-adguard-prompt',
  templateUrl: './adguard-prompt.component.html',
  styleUrl: './adguard-prompt.component.css',
})
export class AdguardPromptComponent {
  visible = false;
  link = '';
  platform = '';

  ngOnInit() {
    if (localStorage.getItem('adguard-dismissed')) return;

    this.detectPlatform();

    setTimeout(() => {
      this.visible = true;
    }, 2000);
  }

  dismiss() {
    this.visible = false;
    localStorage.setItem('adguard-dismissed', '1');
  }

  private detectPlatform() {
    const ua = navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(ua)) {
      this.platform = 'iOS';
      this.link = 'https://download.adguardcdn.com/d/137623/ios-vpn';
    } else if (/android/.test(ua)) {
      this.platform = 'Android';
      this.link = 'https://download.adguardcdn.com/d/137623/android-vpn';
    } else if (/edg\//.test(ua)) {
      this.platform = 'Edge';
      this.link = 'https://download.adguardcdn.com/d/137623/ext-vpn-edge';
    } else if (/firefox/.test(ua)) {
      this.platform = 'Firefox';
      this.link = 'https://download.adguardcdn.com/d/137623/ext-vpn-firefox';
    } else if (/opr\/|opera/.test(ua)) {
      this.platform = 'Opera';
      this.link = 'https://download.adguardcdn.com/d/137623/ext-vpn-opera';
    } else if (/chrome/.test(ua) && !/edg\//.test(ua)) {
      this.platform = 'Chrome';
      this.link = 'https://download.adguardcdn.com/d/137623/ext-vpn-chrome';
    } else if (/mac/.test(ua)) {
      this.platform = 'Mac';
      this.link = 'https://download.adguardcdn.com/d/137623/AdGuardVPNInstaller.dmg';
    } else if (/win/.test(ua)) {
      this.platform = 'Windows';
      this.link = 'https://download.adguardcdn.com/d/137623/adguardVPNInstaller.exe';
    } else {
      this.platform = '';
      this.link = 'https://adguard.com?aid=137623';
    }
  }
}
