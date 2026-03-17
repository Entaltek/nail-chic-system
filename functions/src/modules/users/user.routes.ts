import { Router, Request, Response } from 'express';
import * as admin from 'firebase-admin';

const router = Router();
const SUPER_ADMIN_EMAIL = 'sebastian.cano@entaltek.com';

router.get('/', async (req: Request, res: Response) => {
  try {
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users
      .filter(user => user.email !== SUPER_ADMIN_EMAIL)
      .map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      }));

    res.status(200).json({
      status: 'success',
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

export default router;
