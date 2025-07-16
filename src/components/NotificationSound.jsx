import { useEffect } from 'react';

const NotificationSound = () => {
  useEffect(() => {
    // Create an audio context
    const createNotificationSound = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const audioContext = new AudioContext();
        
        // Create a more pleasant notification sound
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Connect nodes
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure sound - two-tone pleasant notification
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        
        // First note
        oscillator1.frequency.setValueAtTime(587.33, audioContext.currentTime); // D5
        oscillator2.frequency.setValueAtTime(783.99, audioContext.currentTime); // G5
        
        // Volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        // Start oscillators
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        
        // Stop oscillators
        oscillator1.stop(audioContext.currentTime + 0.5);
        oscillator2.stop(audioContext.currentTime + 0.5);
        
        // Save the audio context to window for reuse
        window.notificationAudioContext = audioContext;
      } catch (error) {
        console.error('Failed to create notification sound:', error);
      }
    };
    
    // Add a global function to play the notification sound
    window.playNotificationSound = () => {
      createNotificationSound();
    };
    
    return () => {
      // Clean up
      delete window.playNotificationSound;
      if (window.notificationAudioContext) {
        window.notificationAudioContext.close().catch(err => console.error(err));
        delete window.notificationAudioContext;
      }
    };
  }, []);
  
  return null; // This component doesn't render anything
};

export default NotificationSound; 