'use client';
import {useEffect} from 'react';
import {sourceFromLocation,trackEvent} from '@/lib/analytics';

export function VisitTracker({eventName}:{eventName:string}){
  useEffect(()=>{
    void trackEvent(eventName);
    const source=sourceFromLocation();
    if(source)void trackEvent(`source_${source}_visit`);
  },[eventName]);
  return null;
}
