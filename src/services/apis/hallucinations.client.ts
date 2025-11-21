import { httpClient } from '../https/client'
import type {
  HashtagResponseDto,
  HashtagSearchResponseDto,
  HomeResponseDto,
  LoginResponseDto,
  PatchTeamRequestDto,
  PatchTeamResponseDto,
  PatchUserRequestDto,
  PatchUserResponseDto,
  PostHashtagsRequestDto,
  PostHashtagsResponseDto,
  TeamResponseDto,
  UserResponseDto,
} from '../dtos/hallucinations.dto'

class HallucinationsClient {
  readonly prefix = '/hallucinations'
  async login(ssoId: string): Promise<LoginResponseDto> {
    const response = await httpClient.post<LoginResponseDto>(
      `${this.prefix}/v1/auth/login`,
      {
        sso_id: ssoId,
      },
    )
    return response.data
  }

  async getHome(): Promise<HomeResponseDto> {
    const response = await httpClient.get<HomeResponseDto>(
      `${this.prefix}/v1/home`,
    )
    return response.data
  }

  async getTeam(orgId: string): Promise<TeamResponseDto> {
    const response = await httpClient.get<TeamResponseDto>(
      `${this.prefix}/v1/teams/${orgId}`,
    )
    return response.data
  }

  async patchTeam(
    orgId: string,
    data: PatchTeamRequestDto,
  ): Promise<PatchTeamResponseDto> {
    const response = await httpClient.patch<PatchTeamResponseDto>(
      `${this.prefix}/v1/teams/${orgId}`,
      data,
    )
    return response.data
  }

  async getUser(userId: number): Promise<UserResponseDto> {
    const response = await httpClient.get<UserResponseDto>(
      `${this.prefix}/v1/users/${userId}`,
    )
    return response.data
  }

  async patchUser(
    userId: number,
    data: PatchUserRequestDto,
  ): Promise<PatchUserResponseDto> {
    const response = await httpClient.patch<PatchUserResponseDto>(
      `${this.prefix}/v1/users/${userId}`,
      data,
    )
    return response.data
  }

  async getHashtags(): Promise<HashtagResponseDto> {
    const response = await httpClient.get<HashtagResponseDto>(
      `${this.prefix}/v1/hashtags`,
    )
    return response.data
  }

  async postHashtags(
    data: PostHashtagsRequestDto,
  ): Promise<PostHashtagsResponseDto> {
    const response = await httpClient.post<PostHashtagsResponseDto>(
      `${this.prefix}/v1/hashtags`,
      data,
    )
    return response.data
  }

  async getHashtagsSearch(
    hashtagId: number,
  ): Promise<HashtagSearchResponseDto> {
    const response = await httpClient.get<HashtagSearchResponseDto>(
      `${this.prefix}/v1/hashtags/${hashtagId}/search`,
    )
    return response.data
  }
}

const hallucinationsClient = new HallucinationsClient()

export default hallucinationsClient
