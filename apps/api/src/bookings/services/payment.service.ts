import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { normalizePhone } from '../../auth/dto/auth-fields.js';
import { PHONE_PATTERN } from '../../shared/constants/auth.constants.js';
import { PAYMENT } from '../../shared/constants/payment.constants.js';
import type { ApiError, ApiErrorCode } from '../../shared/types/api.types.js';
import type { PayBookingDto } from '../dto/booking.dto.js';

const invalid = (code: ApiErrorCode) =>
  new BadRequestException({ code } satisfies ApiError);
const refused = (code: ApiErrorCode) =>
  new HttpException({ code } satisfies ApiError, HttpStatus.PAYMENT_REQUIRED);

@Injectable()
export class PaymentService {
  charge(input: PayBookingDto, now: Date): void {
    if (input.method === 'card') return this.chargeCard(input, now);
    return this.chargeWallet(input);
  }

  private chargeWallet(
    input: Extract<PayBookingDto, { method: 'bkash' | 'nagad' | 'rocket' }>,
  ) {
    if (!PHONE_PATTERN.test(normalizePhone(input.number))) {
      throw invalid('INVALID_WALLET_NUMBER');
    }
    if (input.otp !== PAYMENT.wallet.otp) throw invalid('INVALID_OTP');
    if (input.pin === PAYMENT.wallet.insufficientBalancePin) {
      throw refused('INSUFFICIENT_BALANCE');
    }
    if (input.pin !== PAYMENT.wallet.pin) throw invalid('INVALID_PIN');
  }

  private chargeCard(
    input: Extract<PayBookingDto, { method: 'card' }>,
    now: Date,
  ) {
    const number = input.number.replace(/[\s-]/g, '');
    const expiry = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(input.expiry);
    const cvcOk = /^\d{3}$/.test(input.cvc);
    if (!/^\d{16}$/.test(number) || !expiry || !cvcOk) {
      throw invalid('INVALID_CARD');
    }
    const year = 2000 + Number(expiry[2]);
    const month = Number(expiry[1]);
    const nowYear = now.getUTCFullYear();
    const nowMonth = now.getUTCMonth() + 1;
    if (year < nowYear || (year === nowYear && month < nowMonth)) {
      throw invalid('INVALID_CARD');
    }
    if (number === PAYMENT.card.declinedNumber) throw refused('CARD_DECLINED');
    if (number !== PAYMENT.card.successNumber) throw invalid('INVALID_CARD');
  }
}
