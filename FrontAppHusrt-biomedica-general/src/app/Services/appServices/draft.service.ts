import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DraftService {

    constructor() { }

    saveDraft(key: string, data: any): void {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(`draft_${key}`, JSON.stringify({
                data,
                timestamp: new Date().getTime()
            }));
        }
    }

    getDraft(key: string): any {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem(`draft_${key}`);
            if (saved) {
                return JSON.parse(saved);
            }
        }
        return null;
    }

    clearDraft(key: string): void {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(`draft_${key}`);
        }
    }

    hasDraft(key: string): boolean {
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem(`draft_${key}`) !== null;
        }
        return false;
    }
}
