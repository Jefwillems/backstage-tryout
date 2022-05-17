import {createRouter, defaultAuthProviderFactories, providers} from '@backstage/plugin-auth-backend';
import {Router} from 'express';
import {PluginEnvironment} from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
    database: env.database,
    discovery: env.discovery,
    tokenManager: env.tokenManager,
    providerFactories: {
      ...defaultAuthProviderFactories,
      github: providers.github.create({
        signIn: {
          resolver:
            async (info, ctx) => {
              const {
                profile: {email},
              } = info;
              // Profiles are not always guaranteed to to have an email address.
              // You can also find more provider-specific information in `info.result`.
              // It typically contains a `fullProfile` object as well as ID and/or access
              // tokens that you can use for additional lookups.
              if (!email) {
                throw new Error('User profile contained no email');
              }

              // This example resolver simply uses the local part of the email as the name.
              const [name] = email.split('@');

              // This helper function handles sign-in by looking up a user in the catalog.
              // The lookup can be done either by reference, annotations, or custom filters.
              //
              // The helper also issues a token for the user, using the standard group
              // membership logic to determine the ownership references of the user.
              return ctx.signInWithCatalogUser({
                entityRef: {name},
              });
            }
        },
        authHandler: async (input) => {
          const username = input.fullProfile.username;
          const {photos} = input.fullProfile;
          return {
            profile: {
              displayName: username,
              email: input.fullProfile.emails?.join(';'),
              picture: photos ? photos[0].value : undefined
            }
          }
        }
      })
    }
  });
}
