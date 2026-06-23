import { describe, expect, it, vi } from "vitest";

import { CommitService } from "./commitService";
import type { Commit, Reflection } from "../types";

const commit: Commit = {
  id: "10000000-0000-0000-0000-000000000001",
  userId: "00000000-0000-0000-0000-000000000001",
  title: "Lower body restart",
  type: "training",
  recordedAt: "2026-06-22T08:00:00.000Z",
  durationMinutes: 45,
  intensity: "steady",
  note: null,
  visibility: "circle",
  evidence: [],
  createdAt: "2026-06-22T08:01:00.000Z",
  deletedAt: null,
};

const reflection: Reflection = {
  id: "20000000-0000-0000-0000-000000000001",
  userId: commit.userId,
  commitId: commit.id,
  content: "Small promises count.",
  type: "process",
  visibility: "private",
  createdAt: "2026-06-22T08:02:00.000Z",
  updatedAt: "2026-06-22T08:02:00.000Z",
  deletedAt: null,
};

function makeRepos() {
  return {
    commits: {
      publishCommit: vi.fn().mockResolvedValue(commit),
      findCommit: vi.fn(),
      listCommitsForProfile: vi.fn(),
      changeCommitVisibility: vi.fn(),
      removeCommit: vi.fn(),
    },
    reflections: {
      createReflection: vi.fn().mockResolvedValue(reflection),
      editReflection: vi.fn(),
      removeReflection: vi.fn(),
      listReflectionsForCommit: vi.fn(),
    },
    rpc: {
      getCommitDetail: vi.fn(),
    },
  };
}

describe("CommitService", () => {
  it("orchestrates Commit and Reflection repositories without Supabase details", async () => {
    const { commits, reflections, rpc } = makeRepos();
    const service = new CommitService(commits, reflections, rpc);

    await expect(
      service.publishCommit(commit.userId, { title: commit.title })
    ).resolves.toEqual(commit);
    await expect(
      service.createReflection(commit.userId, {
        commitId: commit.id,
        content: reflection.content,
      })
    ).resolves.toEqual(reflection);

    expect(commits.publishCommit).toHaveBeenCalledWith(commit.userId, {
      title: commit.title,
    });
    expect(reflections.createReflection).toHaveBeenCalledWith(commit.userId, {
      commitId: commit.id,
      content: reflection.content,
    });
  });

  it("publishCommitWithReflection creates commit then reflection", async () => {
    const { commits, reflections, rpc } = makeRepos();
    const service = new CommitService(commits, reflections, rpc);

    const result = await service.publishCommitWithReflection(commit.userId, {
      title: commit.title,
      reflectionContent: reflection.content,
    });

    expect(result).toEqual(commit);
    expect(commits.publishCommit).toHaveBeenCalledOnce();
    expect(reflections.createReflection).toHaveBeenCalledWith(commit.userId, {
      commitId: commit.id,
      content: reflection.content,
      type: "process",
      visibility: "circle",
    });
  });

  it("publishCommitWithReflection returns commit even when reflection creation fails", async () => {
    const { commits, reflections, rpc } = makeRepos();
    reflections.createReflection.mockRejectedValue(new Error("DB error"));
    const service = new CommitService(commits, reflections, rpc);

    const result = await service.publishCommitWithReflection(commit.userId, {
      title: commit.title,
      reflectionContent: reflection.content,
    });

    expect(result).toEqual(commit);
    expect(commits.publishCommit).toHaveBeenCalledOnce();
    expect(reflections.createReflection).toHaveBeenCalledOnce();
  });

  it("publishCommitWithReflection skips reflection when content is empty", async () => {
    const { commits, reflections, rpc } = makeRepos();
    const service = new CommitService(commits, reflections, rpc);

    const result = await service.publishCommitWithReflection(commit.userId, {
      title: commit.title,
      reflectionContent: null,
    });

    expect(result).toEqual(commit);
    expect(reflections.createReflection).not.toHaveBeenCalled();
  });
});
