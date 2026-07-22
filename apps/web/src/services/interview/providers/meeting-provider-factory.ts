import { MeetingProvider } from "../interfaces/meeting-provider.interface";
import { MeetingProviderType } from "../interfaces/interview.interface";
import { logger } from "@smarthire/logger";

class GoogleMeetProvider implements MeetingProvider {
  async generateMeetingLink(title: string, startTime: string, durationMinutes: number): Promise<string> {
    logger.info(`[GoogleMeetProvider] Generating mock link for ${title} at ${startTime} duration: ${durationMinutes}m`);
    // Random 3-4-3 string
    const segment = () => Math.random().toString(36).substring(2, 6);
    return `https://meet.google.com/${segment()}-${segment()}-${segment()}`;
  }
}

class ZoomProvider implements MeetingProvider {
  async generateMeetingLink(title: string): Promise<string> {
    logger.info(`[ZoomProvider] Generating mock link for ${title}`);
    const meetingId = Math.floor(1000000000 + Math.random() * 9000000000);
    return `https://zoom.us/j/${meetingId}?pwd=mock-${Math.random().toString(36).substring(2, 10)}`;
  }
}

class TeamsProvider implements MeetingProvider {
  async generateMeetingLink(title: string): Promise<string> {
    logger.info(`[TeamsProvider] Generating mock link for ${title}`);
    const meetId = Math.random().toString(36).substring(2, 15);
    return `https://teams.live.com/meet/${meetId}`;
  }
}

export const meetingProviderFactory = {
  getMeetingProvider(type: MeetingProviderType): MeetingProvider {
    switch (type) {
      case "google_meet":
        return new GoogleMeetProvider();
      case "zoom":
        return new ZoomProvider();
      case "msteams":
        return new TeamsProvider();
      default:
        throw new Error(`Unsupported meeting provider type: ${type}`);
    }
  },
};
