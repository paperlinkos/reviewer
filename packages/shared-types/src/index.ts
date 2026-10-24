/** Stable contracts shared by browser surfaces and the API. */
export type Id<T extends string> = string & { readonly __brand: T };
export type ProjectId = Id<'ProjectId'>;
export type ReviewSessionId = Id<'ReviewSessionId'>;
export type FeedbackId = Id<'FeedbackId'>;

export const CONTRACT_VERSION = 'v1' as const;
export type FeedbackSourcePlatform = 'chrome_extension' | 'web_widget' | 'android' | 'ios' | 'desktop';
export type TaskStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export interface AnnotationGeometryV1 { version: typeof CONTRACT_VERSION; kind: 'point' | 'rectangle' | 'arrow'; x: number; y: number; width?: number; height?: number; endX?: number; endY?: number; }
export interface MediaAttachmentV1 { version: typeof CONTRACT_VERSION; id: string; mediaType: 'screenshot' | 'audio'; contentType: string; byteSize: number; objectKey: string; }
export interface ProjectIdentity { id: ProjectId; workspaceId: string; name: string; }
export interface ReviewSessionIdentity { id: ReviewSessionId; projectId: ProjectId; origin: string; }
export interface FeedbackIdentity { id: FeedbackId; projectId: ProjectId; sessionId: ReviewSessionId; source: FeedbackSourcePlatform; status: TaskStatus; }
