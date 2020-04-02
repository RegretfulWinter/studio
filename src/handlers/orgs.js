const db = require('../lib/db');

const orgs = module.exports;

const formatOrg = (org) => {
  if (!org) return org;
  if (org.created_at) org.created_at = String(org.created_at);
  if (org.joined_organization_at) org.joined_organization_at = String(org.joined_organization_at);
  if (org.developer_portal_visibility) {
    org.developerPortalVisibility = String(org.developer_portal_visibility);
    delete org.developer_portal_visibility;
  }
  return org;
}

const formatList = (list) => {
  if (Array.isArray(list)) return list.map(formatOrg);
  return list;
}

const formatUser = (user) => {
  if (user.created_at) user.created_at = String(user.created_at);
  if (user.joined_organization_at) user.joined_organization_at = String(user.joined_organization_at);
  return user;
}

const formatUserList = (list) => {
  if (Array.isArray(list)) return list.map(formatUser);
  return list;
}

orgs.list = async (userId) => {
  const result = await db.query(
    'SELECT * FROM organizations_users ou LEFT JOIN organizations o ON ou.organization_id = o.id WHERE ou.user_id = $1',
    [userId]
  );

  return formatList(result.rows);
};

orgs.get = async (id) => {
  const result = await db.query(
    'SELECT * FROM organizations WHERE id = $1',
    [id]
  );

  return formatOrg(result.rows[0]);
};

orgs.getBySlug = async (slug) => {
  const result = await db.query(
    'SELECT * FROM organizations WHERE slug = $1',
    [slug]
  );

  return formatOrg(result.rows[0]);
};

orgs.getForUser = async (userId, orgId) => {
  let result;

  if (orgId) {
    result = await db.query(
      'SELECT o.* FROM organizations o INNER JOIN organizations_users ou ON o.id = ou.organization_id WHERE o.id = $1 AND ou.user_id = $2',
      [orgId, userId]
    );
  } else {
    result = await db.query(
      'SELECT o.* FROM organizations o INNER JOIN organizations_users ou ON o.id = ou.organization_id WHERE ou.user_id = $1',
      [userId]
    );
  }

  return formatOrg(result.rows[0]);
};

orgs.CreateError = class CreateError extends Error {
  constructor(errs) {
    super();
    this.errs = errs;
  }
}

orgs.createWithTransaction = async (name, slug, creatorId) => {
  await db.query('BEGIN');
  try {
    const org = await orgs.create(name, slug, creatorId);
    await db.query('COMMIT');
    return org;
  } catch (e) {
    console.error(e);
    await db.query('ROLLBACK');
  }
}

orgs.create = async (name, slug, creatorId) => {
  const result = await db.query(
    `INSERT INTO organizations (name, slug) VALUES ($1, $2) ON CONFLICT ON CONSTRAINT organizations_slug DO NOTHING RETURNING *`,
    [name, slug]
  );

  await orgs.addUser(creatorId, result.rows[0].id, 'admin');

  return formatOrg(result.rows[0]);
};

orgs.patch = async (id, changedFields) => {
  const updateValues = Object.values(changedFields).filter(Boolean);
  const updateString = Object.keys(changedFields).filter(k => changedFields[k] !== undefined).map((k, i) => `${k}=$${i + 1}`).join(',');

  const result = await db.query(
    `UPDATE organizations SET ${updateString} WHERE id = $${updateValues.length + 1} RETURNING *`,
    [...updateValues, id]
  );

  return formatOrg(result.rows[0]);
};

orgs.findUser = async (userId, organizationId) => {
  const result = await db.query(
    'SELECT * FROM organizations_users WHERE organization_id = $1 AND user_id = $2',
    [organizationId, userId]
  );

  return result.rows[0];
};

orgs.addUser = async (userId, organizationId, role) => {
  await db.query(
    'INSERT INTO organizations_users (organization_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT ON CONSTRAINT organizations_users_organization_id_user_id DO UPDATE SET role = organizations_users.role',
    [organizationId, userId, role.toLowerCase()]
  );
};

orgs.listUsers = async (organizationId) => {
  const result = await db.query(
    'SELECT *, ou.created_at AS joined_organization_at FROM organizations_users ou INNER JOIN users u ON ou.user_id = u.id WHERE ou.organization_id = $1 ORDER BY ou.role, u.display_name ASC',
    [organizationId]
  );

  return formatUserList(result.rows);
};

orgs.makeUserAdmin = async (organizationId, userId) => {
  await db.query(
    'UPDATE organizations_users SET role = $1 WHERE organization_id = $2 AND user_id = $3',
    ['admin', Number(organizationId), Number(userId)]
  );
};

orgs.makeUserMember = async (organizationId, userId) => {
  await db.query(
    'UPDATE organizations_users SET role = $1 WHERE organization_id = $2 AND user_id = $3',
    ['member', Number(organizationId), Number(userId)]
  );
};

orgs.removeUser = async (organizationId, userId) => {
  await db.query(
    'DELETE FROM organizations_users WHERE organization_id = $1 AND user_id = $2',
    [Number(organizationId), Number(userId)]
  );
};
