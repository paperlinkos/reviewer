CREATE TYPE "FeedbackStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

CREATE TABLE "Feedback" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "clientSessionId" TEXT NOT NULL,
  "pageUrl" TEXT NOT NULL, "text" TEXT NOT NULL, "x" DOUBLE PRECISION NOT NULL,
  "y" DOUBLE PRECISION NOT NULL, "selector" TEXT, "status" "FeedbackStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "FeedbackComment" (
  "id" TEXT NOT NULL, "feedbackId" TEXT NOT NULL, "authorId" TEXT NOT NULL,
  "text" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FeedbackComment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Feedback_projectId_status_idx" ON "Feedback"("projectId", "status");
CREATE INDEX "Feedback_clientSessionId_idx" ON "Feedback"("clientSessionId");
CREATE INDEX "FeedbackComment_feedbackId_idx" ON "FeedbackComment"("feedbackId");
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE;
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_clientSessionId_fkey" FOREIGN KEY ("clientSessionId") REFERENCES "ClientReviewSession"("id") ON DELETE CASCADE;
ALTER TABLE "FeedbackComment" ADD CONSTRAINT "FeedbackComment_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE;
ALTER TABLE "FeedbackComment" ADD CONSTRAINT "FeedbackComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE;
