export interface Teacher { id: number; name: string }
export interface Group { id: number; name: string; studentCount: number }
export interface Subject { id: number; name: string }
export interface Room { id: number; name: string; capacity: number; type: string }
export interface Lesson {
  id: number; subjectId: number; teacherId: number;
  groupId: number; roomId: number;
  weekday: number; startTime: string; endTime: string;
}