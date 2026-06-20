import test from 'node:test';
import assert from 'node:assert';
import { fileDb } from './fileDb';

test('fileDb CRUD operations', async () => {
  // 1. Read db initial state
  const initialDb = await fileDb.read();
  assert.ok(Array.isArray(initialDb.users), 'Db users must be an array');

  // 2. Insert test user
  const uniqueEmail = `test_${Date.now()}@example.com`;
  const dummyUser = {
    name: 'Testy McTester',
    email: uniqueEmail,
    carbonGoal: 400,
    greenCoins: 50,
    streak: 1,
    badges: ['test-badge']
  };

  const inserted = await fileDb.insert<any>('users', dummyUser);
  assert.ok(inserted._id, 'Inserted user must have an id');
  assert.strictEqual(inserted.email, uniqueEmail, 'Emails must match');
  assert.strictEqual(inserted.name, 'Testy McTester', 'Names must match');

  // 3. Find One test user
  const found = await fileDb.findOne<any>('users', (u) => u._id === inserted._id);
  assert.ok(found, 'User must be found by id');
  assert.strictEqual(found!.email, uniqueEmail, 'Found user email must match');

  // 4. Find List with query
  const list = await fileDb.find<any>('users', (u) => u.email === uniqueEmail);
  assert.strictEqual(list.length, 1, 'Query list should return 1 matching user');
  assert.strictEqual(list[0]._id, inserted._id);

  // 5. Update user
  const updated = await fileDb.update<any>('users', inserted._id, { name: 'Updated Name', greenCoins: 150 });
  assert.ok(updated, 'Update should return the updated user object');
  assert.strictEqual(updated!.name, 'Updated Name', 'Updated name should match');
  assert.strictEqual(updated!.greenCoins, 150, 'Updated greenCoins should match');

  // Verify persistence
  const verified = await fileDb.findOne<any>('users', (u) => u._id === inserted._id);
  assert.strictEqual(verified!.name, 'Updated Name', 'Persisted name should match');

  // 6. Delete user
  const deleted = await fileDb.delete('users', inserted._id);
  assert.strictEqual(deleted, true, 'Delete operation should return true');

  // Verify deletion
  const postDelete = await fileDb.findOne<any>('users', (u) => u._id === inserted._id);
  assert.strictEqual(postDelete, null, 'User must be null after deletion');
});
