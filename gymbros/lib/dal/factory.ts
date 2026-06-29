import {
  CircleRepository,
  CommitRepository,
  NotificationRepository,
  ProfileRepository,
  ReflectionRepository,
  SupportRepository,
} from "./repositories";
import { DomainRpc } from "./rpc";
import {
  AuthService,
  CircleService,
  CommitService,
  JourneyService,
  NotificationService,
  ProfileService,
  ReflectionService,
} from "./services";
import { type DomainDataClient, requireDomainDataClient } from "./client";

export type DomainDataLayer = ReturnType<typeof createDomainDataLayer>;

export function createDomainDataLayer(client: DomainDataClient | null) {
  const domainClient = requireDomainDataClient(client);

  const repositories = {
    profiles: new ProfileRepository(domainClient),
    commits: new CommitRepository(domainClient),
    reflections: new ReflectionRepository(domainClient),
    circle: new CircleRepository(domainClient),
    supports: new SupportRepository(domainClient),
    notifications: new NotificationRepository(domainClient),
  };

  const rpc = new DomainRpc(domainClient);

  const services = {
    auth: new AuthService(domainClient),
    profiles: new ProfileService(repositories.profiles),
    commits: new CommitService(
      repositories.commits,
      repositories.reflections,
      rpc
    ),
    circle: new CircleService(
      repositories.circle,
      repositories.supports,
      rpc,
      repositories.profiles,
      repositories.notifications
    ),
    journey: new JourneyService(rpc),
    notifications: new NotificationService(repositories.notifications),
    reflections: new ReflectionService(repositories.reflections),
  };

  return {
    repositories,
    rpc,
    services,
  };
}
