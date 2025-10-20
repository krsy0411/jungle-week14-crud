import { ApiProperty } from "@nestjs/swagger";

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: "요청 데이터가 올바르지 않습니다" })
  message: string;

  @ApiProperty({ example: "Bad Request" })
  error: string;
}

export class ValidationErrorDto {
  @ApiProperty({ example: 422 })
  statusCode: number;

  @ApiProperty({ example: "입력 데이터 검증 실패" })
  message: string;

  @ApiProperty({
    type: "array",
    items: {
      type: "object",
      properties: {
        field: { type: "string", example: "email" },
        message: { type: "string", example: "유효한 이메일 주소가 아닙니다" },
      },
    },
  })
  errors: Array<{ field: string; message: string }>;
}
