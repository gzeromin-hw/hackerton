import { httpClient } from '../https/client'
import type {
  ChatSearchRequestDto,
  ChatSearchResponseDto,
} from '../dtos/chat.client.dto'

class ChatClient {
  readonly prefix = '/chat'
  async getChats(
    request: ChatSearchRequestDto,
  ): Promise<ChatSearchResponseDto> {
    const response = await httpClient.post<ChatSearchResponseDto>(
      `${this.prefix}/v1/search/query`,
      request,
    )
    return response.data
  }
}

const chatClient = new ChatClient()

export default chatClient
