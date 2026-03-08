import { RiskIntelligenceService } from './risk-intelligence.service';

describe('RiskIntelligenceService', () => {
  const openMeteoServiceMock = {
    getForecast: jest.fn(),
  };

  const prismaMock = {
    userLocationSnapshot: {
      findUnique: jest.fn(),
    },
    riskRegionSnapshot: {
      findMany: jest.fn(),
    },
    familyMember: {
      findMany: jest.fn(),
    },
  };

  const service = new RiskIntelligenceService(
    openMeteoServiceMock as never,
    prismaMock as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns provider-backed forecast payload', async () => {
    openMeteoServiceMock.getForecast.mockResolvedValue({
      latitude: 1,
      longitude: 2,
      hourly: { time: [] },
    });

    await expect(service.getForecast(1, 2, 2)).resolves.toEqual({
      location: {
        latitude: 1,
        longitude: 2,
      },
      forecast: {
        latitude: 1,
        longitude: 2,
        hourly: { time: [] },
      },
    });
  });

  it('returns non-impacted when user location is missing', async () => {
    prismaMock.userLocationSnapshot.findUnique.mockResolvedValue(null);
    prismaMock.riskRegionSnapshot.findMany.mockResolvedValue([]);
    prismaMock.familyMember.findMany.mockResolvedValue([]);

    await expect(service.getUserImpact('user-1')).resolves.toEqual({
      userId: 'user-1',
      impacted: false,
      impacts: [],
      family: [],
    });
  });
});
