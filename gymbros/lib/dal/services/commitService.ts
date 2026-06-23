import type {
  ChangeCommitVisibilityInput,
  CreateReflectionInput,
  EditReflectionInput,
  PublishCommitInput,
} from "../schemas";
import type {
  Commit,
  CommitDetail,
  PaginationOptions,
  Reflection,
} from "../types";

type CommitDataAccess = {
  publishCommit(profileId: string, input: PublishCommitInput): Promise<Commit>;
  findCommit(commitId: string): Promise<Commit>;
  listCommitsForProfile(
    profileId: string,
    options?: PaginationOptions
  ): Promise<Commit[]>;
  changeCommitVisibility(input: ChangeCommitVisibilityInput): Promise<Commit>;
  removeCommit(commitId: string): Promise<Commit>;
};

type ReflectionDataAccess = {
  createReflection(
    profileId: string,
    input: CreateReflectionInput
  ): Promise<Reflection>;
  editReflection(input: EditReflectionInput): Promise<Reflection>;
  removeReflection(reflectionId: string): Promise<Reflection>;
};

type CommitRpcAccess = {
  getCommitDetail(commitId: string): Promise<CommitDetail>;
};

export class CommitService {
  constructor(
    private readonly commits: CommitDataAccess,
    private readonly reflections: ReflectionDataAccess,
    private readonly rpc: CommitRpcAccess
  ) {}

  publishCommit(profileId: string, input: PublishCommitInput): Promise<Commit> {
    return this.commits.publishCommit(profileId, input);
  }

  async publishCommitWithReflection(
    profileId: string,
    input: PublishCommitInput & { reflectionContent?: string | null }
  ): Promise<Commit> {
    const commit = await this.commits.publishCommit(profileId, input);
    const reflectionContent = input.reflectionContent?.trim();

    if (reflectionContent) {
      // Reflection is supplementary; a creation failure must not roll back the commit.
      await this.reflections
        .createReflection(profileId, {
          commitId: commit.id,
          content: reflectionContent,
          type: "process",
          visibility: commit.visibility === "private" ? "private" : "circle",
        })
        .catch(() => undefined);
    }

    return commit;
  }

  findCommit(commitId: string): Promise<Commit> {
    return this.commits.findCommit(commitId);
  }

  getCommitDetail(commitId: string): Promise<CommitDetail> {
    return this.rpc.getCommitDetail(commitId);
  }

  listCommitsForProfile(
    profileId: string,
    options?: PaginationOptions
  ): Promise<Commit[]> {
    return this.commits.listCommitsForProfile(profileId, options);
  }

  changeCommitVisibility(input: ChangeCommitVisibilityInput): Promise<Commit> {
    return this.commits.changeCommitVisibility(input);
  }

  removeCommit(commitId: string): Promise<Commit> {
    return this.commits.removeCommit(commitId);
  }

  createReflection(
    profileId: string,
    input: CreateReflectionInput
  ): Promise<Reflection> {
    return this.reflections.createReflection(profileId, input);
  }

  editReflection(input: EditReflectionInput): Promise<Reflection> {
    return this.reflections.editReflection(input);
  }

  removeReflection(reflectionId: string): Promise<Reflection> {
    return this.reflections.removeReflection(reflectionId);
  }
}
