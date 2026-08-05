/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseBrowser } from "@/lib/supabase/browser";
import {
  mapGroups,
  mapGroupToRaw,
  mapSubgroups,
  mapSubgroupToRaw,
} from "@/mappers/groups.mapper";
import { Group, Subgroup } from "@/types/group.types";

const supabase = supabaseBrowser();

export const getGroups = async (): Promise<Group[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("code", { ascending: true });

      if (error) {
        console.error("Error fetching groups:", error);
        return reject(error.message);
      }

      return resolve(mapGroups(data));
    } catch (error: any) {
      console.error("Error in getGroups:", error);
      reject(error.message);
    }
  });
};

export const getSubgroups = async (): Promise<Subgroup[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      const { data, error } = await supabase
        .from("subgroups")
        .select("*")
        .order("code_group", { ascending: true })
        .order("code", { ascending: true });

      if (error) {
        console.error("Error fetching subgroups:", error);
        return reject(error.message);
      }

      return resolve(mapSubgroups(data));
    } catch (error: any) {
      console.error("Error in getSubgroups:", error);
      reject(error.message);
    }
  });
};

export const addGroup = async (props: Partial<Group>): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      const { data, error } = await supabase
        .from("groups")
        .insert([{ ...mapGroupToRaw(props) }])
        .single();

      if (error) {
        console.error("Error adding group:", error);
        return reject(error.message);
      }

      return resolve(data);
    } catch (error: any) {
      console.error("Error in addGroup:", error);
      reject(error.message);
    }
  });
};

export const addSubgroup = async (props: Partial<Subgroup>): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      const { data, error } = await supabase
        .from("subgroups")
        .insert([{ ...mapSubgroupToRaw(props) }])
        .single();

      if (error) {
        console.error("Error adding subgroup:", error);
        return reject(error.message);
      }

      return resolve(data);
    } catch (error: any) {
      console.error("Error in addSubgroup:", error);
      reject(error.message);
    }
  });
};
