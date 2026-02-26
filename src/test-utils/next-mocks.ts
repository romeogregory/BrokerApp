import { vi } from "vitest";

export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn().mockResolvedValue(undefined),
};

export const mockParams: Record<string, string> = {};
export const mockSearchParams = new URLSearchParams();

export function setupNavigationMocks() {
  return {
    useRouter: () => mockRouter,
    useParams: () => mockParams,
    useSearchParams: () => mockSearchParams,
    usePathname: () => "/",
    redirect: vi.fn(),
    notFound: vi.fn(),
  };
}

export function resetNavigationMocks() {
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
  mockRouter.back.mockClear();
  mockRouter.forward.mockClear();
  mockRouter.refresh.mockClear();
  mockRouter.prefetch.mockClear();
  for (const key of Object.keys(mockParams)) {
    delete mockParams[key];
  }
}
