using System;
using System.Collections.Generic;

namespace GreenSolution.Core.Utils
{
    public static class GuidHelper
    {
        private static readonly Dictionary<Guid, string> GuidToIdMap = new();
        private static readonly Dictionary<string, Guid> IdToGuidMap = new();

        static GuidHelper()
        {
            // Register standard seed IDs to build a bidirectional lookup
            for (int i = 1; i <= 200; i++)
            {
                RegisterId($"f{i}");
                RegisterId($"p{i}");
                RegisterId($"mp{i}");
            }
        }

        private static void RegisterId(string id)
        {
            using var md5 = System.Security.Cryptography.MD5.Create();
            byte[] hash = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(id));
            var guid = new Guid(hash);
            GuidToIdMap[guid] = id;
            IdToGuidMap[id] = guid;
        }

        public static string ResolveGuidToId(Guid guid)
        {
            if (GuidToIdMap.TryGetValue(guid, out var id))
            {
                return id;
            }
            return guid.ToString();
        }

        public static Guid ResolveIdToGuid(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return Guid.Empty;
            }

            if (IdToGuidMap.TryGetValue(id, out var guid))
            {
                return guid;
            }

            if (Guid.TryParse(id, out var parsedGuid))
            {
                return parsedGuid;
            }

            // Fallback for custom string IDs: generate deterministically
            using var md5 = System.Security.Cryptography.MD5.Create();
            byte[] hash = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(id));
            var generated = new Guid(hash);
            GuidToIdMap[generated] = id;
            IdToGuidMap[id] = generated;
            return generated;
        }

        public static string FromGuid(Guid guid)
        {
            return ResolveGuidToId(guid);
        }

        public static Guid ToGuid(string id)
        {
            return ResolveIdToGuid(id);
        }
    }
}
