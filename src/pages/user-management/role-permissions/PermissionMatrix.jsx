'use client';

import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import styles from './styles/permission.module.css';

export default function PermissionMatrix({
  screens = [],
  actions = [],
  permissions = {},
  onChange,
  loading = false,
}) {
  const isScreenFullySelected = (screenId) => {
    if (!actions.length) {
      return false;
    }

    return actions.every(
      (action) =>
        permissions?.[screenId]?.[action._id] === true,
    );
  };

  const isActionFullySelected = (actionId) => {
    if (!screens.length) {
      return false;
    }

    return screens.every(
      (screen) =>
        permissions?.[screen._id]?.[actionId] === true,
    );
  };

  const handleScreenSelectAll = (
    screenId,
    checked,
  ) => {
    actions.forEach((action) => {
      onChange(
        screenId,
        action._id,
        checked,
      );
    });
  };

  const handleActionSelectAll = (
    actionId,
    checked,
  ) => {
    screens.forEach((screen) => {
      onChange(
        screen._id,
        actionId,
        checked,
      );
    });
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: 220,
        }}
      >
        <CircularProgress size={24} />
      </div>
    );
  }

  if (!screens.length || !actions.length) {
    return (
      <div className="text-center py-4">
        <Typography
          variant="body2"
          sx={{
            fontSize: '12px',
            color: '#8a8f98',
          }}
        >
          No permission configuration available.
        </Typography>
      </div>
    );
  }

  return (
    <div className={styles.permissionTableWrapper}>

      <div className="table-responsive">

        <table
          className={`table mb-0 ${styles.permissionTable}`}
        >
          <thead>
            <tr>

              {/* Screen Header */}
              <th
                className={
                  styles.permissionScreenHeader
                }
              >
                <div className="d-flex align-items-center justify-content-between">

                  <div>
                    <div
                      className={
                        styles.permissionHeaderTitle
                      }
                    >
                      Screens
                    </div>

                    <div
                      className={
                        styles.permissionHeaderSubtitle
                      }
                    >
                      Select access
                    </div>
                  </div>

                </div>
              </th>

              {/* Action Headers */}
              {actions.map((action) => {
                const selected =
                  isActionFullySelected(
                    action._id,
                  );

                return (
                  <th
                    key={action._id}
                    className={
                      styles.permissionActionHeader
                    }
                  >

                    <div
                      className={
                        styles.permissionActionTitle
                      }
                    >
                      {action.name}
                    </div>

                    <div
                      className={
                        styles.permissionActionCode
                      }
                    >
                      {action.code}
                    </div>

                    <Tooltip
                      title={
                        selected
                          ? `Remove ${action.name} from all screens`
                          : `Grant ${action.name} to all screens`
                      }
                    >
                      <Checkbox
                        size="small"
                        checked={selected}
                        onChange={(event) =>
                          handleActionSelectAll(
                            action._id,
                            event.target.checked,
                          )
                        }
                        sx={{
                          padding: '2px',
                          marginTop: '1px',
                        }}
                      />
                    </Tooltip>

                  </th>
                );
              })}

            </tr>
          </thead>

          <tbody>

            {screens.map((screen, index) => {
              const screenSelected =
                isScreenFullySelected(
                  screen._id,
                );

              return (
                <tr
                  key={screen._id}
                  className={
                    index % 2 === 0
                      ? styles.permissionRowEven
                      : undefined
                  }
                >

                  {/* Screen */}
                  <td
                    className={
                      styles.permissionScreenCell
                    }
                  >

                    <div className="d-flex align-items-center gap-2">

                      <div
                        className={
                          styles.permissionScreenIcon
                        }
                      >
                        {screen.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      <div className="min-w-0">

                        <div
                          className={
                            styles.permissionScreenName
                          }
                        >
                          {screen.name}
                        </div>

                        {screen.code && (
                          <div
                            className={
                              styles.permissionScreenCode
                            }
                          >
                            {screen.code}
                          </div>
                        )}

                      </div>

                    </div>

                    <Tooltip
                      title={
                        screenSelected
                          ? `Remove all permissions from ${screen.name}`
                          : `Grant all permissions to ${screen.name}`
                      }
                    >
                      <Checkbox
                        size="small"
                        checked={screenSelected}
                        onChange={(event) =>
                          handleScreenSelectAll(
                            screen._id,
                            event.target.checked,
                          )
                        }
                        sx={{
                          position: 'absolute',
                          right: 6,
                          top: '50%',
                          transform:
                            'translateY(-50%)',
                          padding: '2px',
                        }}
                      />
                    </Tooltip>

                  </td>

                  {/* Permission Cells */}
                  {actions.map((action) => {
                    const checked =
                      permissions?.[
                        screen._id
                      ]?.[action._id] === true;

                    return (
                      <td
                        key={`${screen._id}-${action._id}`}
                        className={`${styles.permissionCell} ${
                          checked
                            ? styles.permissionCellActive
                            : ''
                        }`}
                      >
                        <Checkbox
                          size="small"
                          checked={checked}
                          onChange={(event) =>
                            onChange(
                              screen._id,
                              action._id,
                              event.target.checked,
                            )
                          }
                        />
                      </td>
                    );
                  })}

                </tr>
              );
            })}

          </tbody>
        </table>

      </div>

      {/* Footer */}
      <div
        className={
          styles.permissionTableFooter
        }
      >
        <div className="d-flex justify-content-between align-items-center">

          <span className="text-muted">
            {screens.length} screens
            <span className="mx-2">•</span>
            {actions.length} actions
          </span>

          <span className="text-muted d-none d-sm-inline">
            Click column or row checkbox to select all
          </span>

        </div>
      </div>

    </div>
  );
}