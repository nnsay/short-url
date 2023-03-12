import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service'
import { ConfigModule } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UrlEntity } from './url.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('test url service', () => {
  let urlService: UrlService;
  const mockUrlEntity = new UrlEntity();
  mockUrlEntity.id = 1;
  mockUrlEntity.originUrl = 'https://www.baidu.com';
  mockUrlEntity.shortUrl = 'https://short.url/1';
  let urlRepositoryMock: { [k in keyof Repository<UrlEntity>]?: jest.Mock } = {
    findOneBy: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(mockUrlEntity),
    update: jest.fn().mockResolvedValue(1)
  };
  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
      ],
      providers: [
        UrlService,
        {
          provide: getRepositoryToken(UrlEntity),
          useValue: urlRepositoryMock
        },
      ]
    }).compile();
    urlService = app.get<UrlService>(UrlService);
    urlRepositoryMock = app.get(getRepositoryToken(UrlEntity));
  })

  test('add url', async () => {
    const { shortUrl } = await urlService.addUrl(mockUrlEntity.originUrl)
    expect(shortUrl).toEqual(mockUrlEntity.shortUrl)
    expect(urlRepositoryMock.findOneBy.mock.calls[0][0]).toEqual({ originUrl: mockUrlEntity.originUrl })
    expect(urlRepositoryMock.save).toBeCalled();
    expect(urlRepositoryMock.update).toBeCalledWith({ id: mockUrlEntity.id }, { shortUrl: mockUrlEntity.shortUrl })
  })
})