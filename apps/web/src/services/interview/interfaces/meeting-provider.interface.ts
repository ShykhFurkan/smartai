/**
 * Meeting Provider Abstraction
 */
export interface MeetingProvider {
  generateMeetingLink(
    title: string,
    startTime: string,
    durationMinutes: number
  ): Promise<string>;
}
